import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util'
import {
  zProviderAccount,
  zUser,
  zYodleeInstitution,
  zYodleeProvider,
} from './yodlee.types'
import {
  zAccessToken,
  zConfig,
  zUserCreds,
  zYodleeEnvName,
  zYodleeId,
} from './YodleeClient'

const zSettings = zUserCreds
  .extend({
    /** Used to be _id */
    providerAccountId: zYodleeId,
    // Cache
    user: zUser.nullish(),
    provider: zYodleeProvider.nullish(),
    providerAccount: zProviderAccount.nullish(),
  })
  // @see https://github.com/samchungy/zod-openapi#zod-effects
  // Ideally when converting we should default to always refType input... Or basically
  // allow the zodToOas31Schema to control this instead.
  .openapi({refType: 'input'})

export const yodleeSchemas = {
  name: z.literal('yodlee'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  integrationData: zYodleeInstitution,
  // Should accessToken be cached based on provider / userId?
  connectInput: z.object({accessToken: zAccessToken, envName: zYodleeEnvName}),
  connectOutput: z
    .object({
      providerAccountId: zYodleeId,
      providerId: zYodleeId, // Technically optional
    })
    .openapi({refType: 'input'}),
} satisfies ConnectorSchemas
export const helpers = connHelpers(yodleeSchemas)

export const yodleeDef = {
  name: 'yodlee',
  schemas: yodleeSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-yodlee.svg'},
  standardMappers: {
    // is the `id` actually externalId?
    integration: (int) => ({
      logoUrl: int.logo,
      loginUrl: int.loginUrl,
      name: int.name ?? `<${int.id}>`,
    }),
    connection: (settings) => ({
      id: `${settings.providerAccountId}`,
      displayName:
        settings.provider?.name ?? `Unnamed <${settings.providerAccountId}>`,
      status: (() => {
        switch (settings.providerAccount?.status) {
          case 'SUCCESS':
            return 'healthy'
          case 'USER_INPUT_REQUIRED':
            return 'disconnected'
          case 'FAILED':
            // Venmo refresh seems to run into this issue
            if (
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              settings.providerAccount.dataset[0]?.updateEligibility ===
              'ALLOW_UPDATE_WITH_CREDENTIALS'
            ) {
              return 'disconnected'
            }
            return 'error'
          // TODO: Handle these three situations
          case 'IN_PROGRESS':
          case 'LOGIN_IN_PROGRESS':
          case 'PARTIAL_SUCCESS':
            return 'healthy'
          default:
            return undefined
        }
      })(),
    }),
  },
} satisfies ConnectorDef<typeof yodleeSchemas>

export default yodleeDef
