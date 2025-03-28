import '@openint/app-config/register.node'
import type {defConnectors} from '@openint/all-connectors/connectors.def'
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {parseConnectorConfigsFromRawEnv} from '@openint/app-config/connector-envs'
import {makeJwtClient} from '@openint/cdk'
import {makeLunchmoneyClient} from '@openint/connector-lunchmoney'
import {makeMootaClient} from '@openint/connector-moota'
import {makeOneBrickClient} from '@openint/connector-onebrick'
// Make this import dynamic at runtime, so we can do
// dynamic-cli plaid ......  or
// OBJ=$pathToPlaid dynamic-cli whatever...
// Or perhaps we can make it into a register and/or loader for nodejs
// much like tsx and others
import {makePlaidClient} from '@openint/connector-plaid'
import {makeRampClient} from '@openint/connector-ramp'
import {makeSaltedgeClient} from '@openint/connector-saltedge'
import {makeTellerClient} from '@openint/connector-teller'
import {makeTogglClient} from '@openint/connector-toggl'
import {makeWiseClient} from '@openint/connector-wise'
import {makeYodleeClient} from '@openint/connector-yodlee'
import {getEnv} from '@openint/env'
import {makePostgresMetaService} from '@openint/meta-service-postgres'
import {initOpenIntSDK} from '@openint/sdk'
import type {ZFunctionMap} from '@openint/util'
import {getEnvVar, R, z, zodInsecureDebug} from '@openint/util'
import type {CliOpts} from './cli-utils'
import {cliFromZFunctionMap} from './cli-utils'

if (getEnvVar('DEBUG_ZOD')) {
  zodInsecureDebug()
}

function env() {
  process.env['_SKIP_ENV_VALIDATION'] = 'true'

  return require('@openint/app-config/env')
    .env as (typeof import('@openint/app-config/env'))['env']
}

function intConfig<T extends keyof typeof defConnectors>(name: T) {
  const config = parseConnectorConfigsFromRawEnv()[name]
  if (!config) {
    throw new Error(`${name} provider is not configured`)
  }
  return config
}

if (require.main === module) {
  type ClientMap = Record<string, () => [ZFunctionMap, CliOpts] | ZFunctionMap>
  const clients: ClientMap = {
    env: () => ({
      ...R.mapValues(env(), (v) => () => v),
      '': () => env(),
    }),
    intConfig: () => ({
      ...R.mapValues(parseConnectorConfigsFromRawEnv(), (v) => () => v),
      '': () => parseConnectorConfigsFromRawEnv(),
    }),
    jwt: () => makeJwtClient({secretOrPublicKey: env().JWT_SECRET!}),
    pgMeta: () =>
      makePostgresMetaService({
        databaseUrl: env().DATABASE_URL,
        viewer: {role: 'system'},
      }) as {},
    plaid: () => makePlaidClient(intConfig('plaid')) as {},
    onebrick: () => makeOneBrickClient(intConfig('onebrick')) as {},
    teller: () => makeTellerClient(intConfig('teller')),
    ramp: () => makeRampClient(intConfig('ramp').oauth),
    wise: () => makeWiseClient(intConfig('wise')),
    toggl: () => makeTogglClient(intConfig('toggl')),
    yodlee: () =>
      makeYodleeClient(
        intConfig('yodlee'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getEnvVar('YODLEE_CREDS', {json: true}) as any,
      ),
    // asana: () => makeAsanaClient({baseURL: ''}),
    lunchmoney: () => makeLunchmoneyClient(intConfig('lunchmoney')),
    moota: () => makeMootaClient(intConfig('moota')),
    // qbo: () => makeQBOClient(intConfig('qbo')),
    saltedge: () => makeSaltedgeClient(intConfig('saltedge')),
    sdk: () =>
      initOpenIntSDK({
        headers: {
          'x-apikey': getEnv('OPENINT_API_KEY'),
          'x-connection-id': getEnv(
            'OPENINT_CONNECTION_ID',
          ) as `conn_${string}`,
        },
      }),
  }

  const clientFactory = z
    .enum(Object.keys(clients) as [keyof typeof clients], {
      errorMap: () => ({message: 'Invalid process.env.CLI'}),
    })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .transform((key) => clients[key]!)
    .parse(getEnvVar('CLI'))

  const [client, opts] = R.pipe(clientFactory(), (r) =>
    Array.isArray(r) ? r : [r],
  )

  cliFromZFunctionMap(client, opts).help().parse()
}
