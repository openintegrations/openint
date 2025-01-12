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
// import {contextFactory} from '../../../apps/app-config/backendConfig'
import {bankingRouter} from '../router'

// const sdk = initPlaidSDK({
//   headers: {
//     'PLAID-CLIENT-ID': testEnvRequired.ccfg_plaid__CLIENT_ID,
//     'PLAID-SECRET': testEnvRequired.ccfg_plaid__CLIENT_SECRET_SANDBOX,
//   },
//   // TODO: This should be explicltly generated also
//   baseUrl: plaidSdkDef.oasMeta.servers[1].url,
// })

test('plaid adapter', async () => {
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

  const res = await bankingRouter.createCaller(ctx).listTransactions({})

  // const res = await instance.POST('/transactions/get', {
  //   body: {
  //     access_token: testEnvRequired.conn_plaid__ACCESS_TOKEN,
  //     start_date: '2025-01-01',
  //     end_date: '2025-01-31',
  //   },
  // })

  console.log(res)
})
