import type NangoFrontend from '@nangohq/frontend'
import type {AuthError} from '@nangohq/frontend'
import {HTTPError} from '@opensdks/runtime'
import type {NangoSDK} from '@opensdks/sdk-nango'
import type {
  NangoProvider,
  UpsertIntegration,
} from '@opensdks/sdk-nango/src/nango.oas'
import {z} from '@opensdks/util-zod'
import {makeUlid} from '@openint/util'
import type {
  ConnectorSchemas,
  ConnectorServer,
  ConnHelpers,
} from '../connector.types'
import {CANCELLATION_TOKEN} from '../frontend-utils'
import type {Id} from '../id.types'
import {extractId, makeId, zId} from '../id.types'
import {zNangoError} from './NangoClient'

export const zAuthMode = z
  .enum(['OAUTH2', 'OAUTH1', 'BASIC', 'API_KEY'])
  .openapi({ref: 'AuthMode'})

export const zOauthConnectionError = z.object({
  code: z.enum(['refresh_token_external_error']).or(z.string()),
  message: z.string().nullish(),
})

const zOauthCredentials = z.object({
  type: zAuthMode,
  /** For API key auth... */
  api_key: z.string().nullish(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  // sometimes this is missing from the response
  expires_at: z.string().datetime().optional(),
  raw: z
    .object({
      access_token: z.string(),
      // sometimes this is missing from the response
      expires_in: z.number().optional(),
      expires_at: z.string().datetime().optional(),
      /** Refresh token (Only returned if the REFRESH_TOKEN boolean parameter is set to true and the refresh token is available) */
      refresh_token: z.string().nullish(),
      refresh_token_expires_in: z.number().nullish(),
      token_type: z.string().nullish(), //'bearer',
      scope: z.string().optional(),
    })
    .passthrough(), // This allows additional properties,
})
export const oauthBaseSchema = {
  name: z.literal('__oauth__'), // TODO: This is a noop
  connectorConfig: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
      /** comma delimited scopes with no spaces in between */
      scopes: z.string().optional(),
    }),
  }),
  connectionSettings: z.object({
    // equivalent to nango /v1/connections data.connection object with certain fields removed like id
    oauth: z.object({
      credentials: zOauthCredentials,
      connection_config: z
        .object({
          portalId: z.number().nullish(),
          instance_url: z.string().nullish(),
        })
        .catchall(z.unknown())
        .nullish(),
      metadata: z.record(z.unknown()).nullable(),
    }),
    // TODO: add error fields here or maybe at a higher level to capture when connection needs to be refreshed
    error: zOauthConnectionError.nullish(),
  }),
  connectOutput: z.object({
    providerConfigKey: zId('ccfg'),
    connectionId: zId('conn'),
  }),
} satisfies ConnectorSchemas

export type OauthBaseTypes = ConnHelpers<typeof oauthBaseSchema>['_types']

function isNangoAuthError(err: unknown): err is AuthError {
  return typeof err === 'object' && err != null && 'type' in err
}

/** Aka `nangoConnect` */
export function oauthConnect({
  nangoFrontend,
  connectorName,
  connectorConfigId,
  connectionId,
  authOptions,
}: {
  nangoFrontend: NangoFrontend
  connectorName: string
  connectorConfigId: Id['ccfg']
  /** Should address the re-connect scenario, but let's see... */
  connectionId?: Id['conn']
  authOptions?: {
    authorization_params?: Record<string, string | undefined>
    connection_params?: Record<string, string>
  }
}): Promise<OauthBaseTypes['connectOutput']> {
  return nangoFrontend
    .auth(
      connectorConfigId,
      connectionId ?? makeId('conn', connectorName, makeUlid()),
      {
        ...authOptions,
        params: {
          ...authOptions?.connection_params,
        },
        authorization_params: {
          ...authOptions?.authorization_params,
          // note: we can in future make this dependant ont he host if not passed by authorization_params
          // ...(redirect_uri ? {redirect_uri} : {}),
        },
      },
    )
    .then((r) => oauthBaseSchema.connectOutput.parse(r))
    .catch((err) => {
      if (isNangoAuthError(err)) {
        if (err.type === 'user_cancelled') {
          throw CANCELLATION_TOKEN
        }
        throw new Error(`${err.type}: ${err.message}`)
      }
      throw err
    })
}

/** aka `makeNangoConnectorServer` */
export function makeOauthConnectorServer({
  nangoClient,
  nangoProvider,
  ccfgId,
}: {
  nangoClient: NangoSDK
  nangoProvider: NangoProvider
  ccfgId: Id['ccfg']
}) {
  const connServer = {
    async postConnect(connectOutput) {
      const {connectionId: connId} = connectOutput
      const res = await nangoClient
        .GET('/connection/{connectionId}', {
          params: {
            path: {connectionId: connId},
            query: {
              provider_config_key: ccfgId,
              refresh_token: true,
              // thought this would make forceRefresh work but wasn't called in the getConnection code path
              // force_refresh: true,
            },
          },
        })
        .then((r) => r.data as OauthBaseTypes['connectionSettings']['oauth'])

      const parsed = zOauthCredentials.safeParse(res.credentials)
      if (!parsed.success) {
        console.error(
          'Provider did not return valid connection settings',
          parsed?.error,
        )
        throw new Error('Provider did not return valid connection settings')
      }
      /* eslint-disable */
      const r = res as any

      return {
        connectionExternalId: extractId(connId)[2],
        settings: {
          oauth: r,
          ...(r?.error?.code || r?.error?.message
            ? {error: {code: r?.error?.code, message: r?.error?.message}}
            : {}),
        },
      }
      /* eslint-enable */
    },
  } satisfies ConnectorServer<typeof oauthBaseSchema>
  return {
    ...connServer,
    upsertConnectorConfig: async (
      config: OauthBaseTypes['connectorConfig'],
    ) => {
      const body: UpsertIntegration = {
        provider_config_key: ccfgId,
        provider: nangoProvider,
        oauth_client_id: config.oauth.client_id,
        oauth_client_secret: config.oauth.client_secret,
        oauth_scopes: config.oauth.scopes,
      }
      await nangoClient.PUT('/config', {body}).catch(async (err) => {
        console.log('got error of type')
        // This is very error prone... If we have different versions runtime
        // Then instanceof in one case would not be the same as instanceof in another case...
        // maybe we should do ducktyping instead of using instanceof?
        // And in general we need a better story around error types in openSDKs anyways
        if (err instanceof HTTPError) {
          const nangoErr = zNangoError.parse(await err.response.json())
          // console.log('httpError', err, nangoErr, nangoErr.error.code)
          if (nangoErr.error.code === 'unknown_provider_config') {
            return nangoClient.POST('/config', {body})
          }
        }
        throw err
      })
    },
  }
}
