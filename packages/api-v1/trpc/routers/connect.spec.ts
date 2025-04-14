import type {CustomerId, Viewer} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import Elysia from 'elysia'
import {oauth2Schemas} from '@openint/cnext/auth-oauth2/schemas'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {env} from '@openint/env'
import {createOAuth2Server} from '@openint/oauth2/createOAuth2Server'
import {$test} from '@openint/util/__tests__/test-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {z} from '@openint/util/zod-utils'
import {trpc} from '../_base'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'

const logger = false

const router = trpc.mergeRouters(
  connectorConfigRouter,
  connectRouter,
  connectionRouter,
  eventRouter,
  customerRouter,
)

const configOauth = {
  client_id: 'client_222',
  client_secret: 'xxx',
  scopes: ['scope1', 'scope2'],

  // should contain whether server requires pkce
} satisfies Z.infer<typeof oauth2Schemas.connector_config>['oauth']

const _oauth2Server = createOAuth2Server({
  clients: [
    {
      id: configOauth.client_id,
      name: configOauth.client_id,
      secret: configOauth.client_secret,
      redirectUris: [env.OAUTH_REDIRECT_URI_GATEWAY],
      allowedGrants: [
        'authorization_code',
        'refresh_token',
        'client_credentials',
      ],
      scopes: configOauth.scopes.map((scope) => ({
        name: scope,
      })),
    },
  ],
  scopes: configOauth.scopes.map((scope) => ({name: scope})),
  users: [{id: 'user_222', username: 'user_222', password: 'xxx'}],
  authCodes: [],
})

const oauth2Server = new Elysia({prefix: '/api/acme-oauth2'}).use(_oauth2Server)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return router.createCaller(
      // inject oauth2Server.handle as fetch for the code exchange later
      routerContextFromViewer({db, viewer, fetch: oauth2Server.handle}),
      {onError},
    )
  }
  const asUser = getCaller({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getCaller({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_222' as CustomerId,
  })
  // Tests linearly depend on each other for performance and simplicty

  const describeMaybeOnly =
    process.env['TEST'] === 'oauth2' ? describe.only : describe

  describeMaybeOnly('oauth2', () => {
    const ccfgRes = $test('create connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'acme-oauth2',
        // TODO: Ensure discriminated union for this.
        config: {oauth: configOauth},
      })

      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'acme-oauth2',
      })

      const parsed = oauth2Schemas.connector_config.parse(res.config)
      expect(parsed.oauth).toEqual(configOauth)

      return res
    })

    const preConnectRes = $test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {},
        },
      })
      return oauth2Schemas.connect_input.parse(res.connect_input)
    })

    const connectRes = $test('connect get 302 redirect', async () => {
      const request = new Request(preConnectRes.current.authorization_url, {
        redirect: 'manual',
      })
      const response = await oauth2Server.handle(request)
      expect(response.status).toBe(302)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const url = new URL(response.headers.get('Location')!)
      expect(url.pathname).toContain('/callback')

      return z
        .object({
          code: z.string(),
          state: z.string(),
          code_verifier: z.string().optional(),
        })
        .parse({
          ...urlSearchParamsToJson(url.searchParams),
          code_verifier: preConnectRes.current.code_verifier,
        })
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: connectRes.current,
        },
      })

      const settings = oauth2Schemas.connection_settings.parse(res.settings)
      return {
        id: res.id,
        settings,
      }
    })

    // use access token to do something useful, like introspect
    test('introspect token', async () => {
      const res = await oauth2Server.handle(
        new Request('http://localhost/api/acme-oauth2/token/introspect', {
          method: 'POST',
          body: new URLSearchParams({
            token:
              postConnectRes.current.settings.oauth.credentials!.access_token,
            client_id: configOauth.client_id,
            client_secret: configOauth.client_secret,
          }),
        }),
      )
      const json = await res.json()
      expect(json.active).toBe(true)
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
      })
      expect(res.settings).toEqual(postConnectRes.current.settings)
    })

    test.todo('check connection')

    test.todo('refresh token')

    test.todo('revoke connection')

    test.todo('handle status update after external revoke')
  })

  describe('apikey based auth', () => {
    const settings = {apiKey: 'key-123'}

    // TODO: create a dummy apikey based connector instead
    const ccfgRes = $test('create connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'greenhouse',
        config: {},
      })
      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'greenhouse',
      })
      return res
    })

    // Not needed really, does not actually even get implemented
    test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {},
        },
      })
      expect(res.connect_input).toEqual({})
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: settings,
        },
      })
      expect(res.settings).toEqual(settings)
      return res
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
      })
      expect(res.settings).toEqual(settings)
    })

    test.todo('check connection')

    test.todo('revoke connection')

    test.todo('handle status update after external revoke')
  })

  describe('custom auth', () => {
    const ccfgRes = $test('create plaid connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'plaid',
        config: {
          envName: 'sandbox',
          clientName: 'Test Client',
          products: ['transactions'],
          countryCodes: ['US'],
          language: 'en',
          credentials: null,
        },
      })
      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'plaid',
      })
      return res
    })

    const preConnectRes = $test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {sandboxPublicTokenCreate: true},
        },
      })
      // TODO: Use plaid schema to parse here.
      expect(res.connect_input).toEqual({public_token: expect.any(String)})
      return res
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: preConnectRes.current.connect_input,
        },
      })

      return res
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
      })
      expect(res.settings).toEqual(postConnectRes.current.settings)
    })

    test.todo('check connection')

    test('revoke connection', async () => {
      const res = await asCustomer.revokeConnection({
        id: postConnectRes.current.id,
      })
      expect(res).toMatchObject({
        id: postConnectRes.current.id,
      })
      // TODO: Check connection settings
    })

    test.todo('handle status update after external revoke')
  })
})

/*

pre connect - get authorization url

connect - visit authorization url, get 302 redirect with code and state
return the needed data to the client via popup

post connect - exchange code for token 


*/
