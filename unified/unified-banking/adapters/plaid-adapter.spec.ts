import type {Id} from '@openint/cdk'
import type {helpers} from '@openint/connector-plaid'
import {
  CountryCode,
  plaidDef,
  plaidServerConnector,
  Products,
} from '@openint/connector-plaid'
import {getContextFactory} from '@openint/engine-backend'
import {env, testEnvRequired} from '@openint/env'
import {bankingRouter} from '../router'
import {plaidAdapter} from './plaid-adapter'

describe('plaid adapter', () => {
  // TODO: Get this from `integration-tests` organization instead of hard-coding
  const config: (typeof helpers._types)['connectorConfig'] = {
    clientName: 'test',
    countryCodes: [CountryCode.Us],
    envName: 'sandbox',
    language: 'en',
    products: [Products.Transactions],
    credentials: {
      clientId: testEnvRequired.ccfg_plaid__CLIENT_ID,
      clientSecret: testEnvRequired.ccfg_plaid__CLIENT_SECRET_SANDBOX,
    },
  }
  const settings: (typeof helpers._types)['connectionSettings'] = {
    accessToken: testEnvRequired.conn_plaid__ACCESS_TOKEN,
  }

  // const instance = plaidServerConnector.newInstance({
  //   config,
  //   settings,
  //   fetchLinks: [],
  //   onSettingsChange: () => {},
  // })

  /* eslint-disable */
  const factory = getContextFactory({
    apiUrl: '',
    clerk: null as any,
    env: env,
    getRedirectUrl: () => '',
    connectors: [{...plaidServerConnector, ...plaidDef} as any],
    authProvider: {} as any,
    getMetaService: () =>
      ({
        tables: {
          connection: {
            get: async () =>
              ({
                settings,
                id: 'conn_plaid_123',
                createdAt: '',
                updatedAt: '',
                connectorName: 'plaid',
                connectorConfigId: 'ccfg_plaid_123',
              }) as any,
          },
          connector_config: {
            get: async () =>
              ({
                config,
                id: 'ccfg_plaid_123',
                createdAt: '',
                updatedAt: '',
                connectorName: 'plaid',
                orgId: 'org_123',
              }) as any,
          },
        },
      }) as any,
    jwtSecret: '',
    nangoSecretKey: '',
  })
  /* eslint-enable */

  const ctx = {
    ...factory.fromViewer({role: 'system'}),
    remoteConnectionId: 'conn_plaid_123' as Id['conn'],
  }
  // console.log('bankingRouter._def.procedures,', bankingRouter._def.procedures)

  test.each(Object.entries(bankingRouter._def.procedures))(
    '%s',
    async (name, procedure) => {
      // only test against queries, not mutations...
      const isQuery = procedure._def.query
      if (!isQuery) {
        console.log('skipping mutation', name)
        return
      }
      // console.log('name', name)
      // await expect(() =>
      //   bankingRouter.createCaller(ctx).listTransactions({}),
      // ).resolves.not.toThrow()
      if (!(name in plaidAdapter)) {
        console.log('skipping unimplemented query', name)
        return
      }
      // TODO: Get this working with queries that require input?

      console.log('Testing', name)
      const res = await bankingRouter
        .createCaller(ctx)
        [name as 'listTransactions']({})
      expect(res).toBeDefined()
    },
  )
})
