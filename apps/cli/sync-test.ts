/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@openint/app-config/register.node'
import {logLink, sync} from '@openint/cdk'
import {plaidProvider} from '@openint/connector-plaid'
import {postgresProvider} from '@openint/connector-postgres'
import type {rxjs} from '@openint/util'
import {R, Rx} from '@openint/util'

function getInstance(
  provider: {
    sourceSync?: (...args: any) => any
    newInstance?: (args: any) => any
  },
  opts: {config: any; settings: any},
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return {...opts, instance: provider.newInstance?.(opts)}
}

function getSource(name: string) {
  switch (name) {
    case 'plaid':
      return plaidProvider.sourceSync({
        customer: null,
        ...getInstance(plaidProvider, {
          config: plaidProvider.schemas.connectorConfig.parse({
            envName: 'sandbox',
            clientId: process.env['int_plaid__clientId'] ?? '',
            clientSecret:
              process.env['int_plaid__clientSecret'] ??
              process.env['int_plaid__secrets__sandbox'] ??
              '',
          }),
          settings: {accessToken: process.env['PLAID_ACCESS_TOKEN'] ?? ''},
        }),
        state: {},
        streams: {},
      })
    default:
      throw new Error(`Unknown source: ${name}`)
  }
}

function getDestination(name: string | undefined) {
  switch (name) {
    // case 'stripe':
    //   return stripeImpl.destinationSync({
    //     config: {apikeyAuth: true},
    //     customer: null,
    //     settings: {secretKey: process.env['STRIPE_TEST_SECRET_KEY']!},
    //     state: {},
    //   })
    case 'postgres':
      return postgresProvider.destinationSync({
        source: undefined,
        config: {},
        state: {},
        customer: null,
        settings: {
          databaseUrl:
            process.env['int_postgres__database_url'] ??
            'postgresql://postgres@localhost/postgres',
        },
      })
    case undefined:
      return (obs: rxjs.Observable<unknown>) =>
        obs.pipe(
          Rx.tap((msg) => {
            console.log(JSON.stringify(msg))
          }),
        )
    default:
      throw new Error(`Unknown destination: ${name}`)
  }
}

sync({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  source: getSource(process.argv[2]!) as any,
  links: R.compact([
    // process.argv[2] === 'plaid' &&
    //   mapStandardEntityLink({
    //     id: 'conn_plaid_demo',
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    //     connectorConfig: {connector: plaidProvider as any},
    //     settings: {},
    //   }),
    process.argv[2] === 'plaid' && logLink({prefix: 'preDest'}),
  ]),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  destination: getDestination(process.argv[3]) as any,
}).catch(console.error)
