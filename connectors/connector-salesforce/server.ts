import {initSalesforceSDK, type SalesforceSDK} from '@opensdks/sdk-salesforce'
import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import {Rx, rxjs} from '@openint/util'
import type {salesforceSchemas} from './def'
import {salesforceHelpers} from './def'

export const SALESFORCE_API_VERSION = '59.0'

export const salesforceServer = {
  newInstance: ({fetchLinks, settings}) => {
    const sdk = initSalesforceSDK({
      baseUrl: `${settings.oauth.connection_config?.instance_url}/services/data/v${SALESFORCE_API_VERSION}`,
      links: (defaultLinks) => [...fetchLinks, ...defaultLinks],
    })
    return sdk
  },

  postConnect: async (connectOutput) => {
    const nango = initNangoSDK({
      headers: {authorization: `Bearer ${process.env['NANGO_SECRET_KEY']}`},
    })
    const nangoConnection = await nango
      .GET('/connection/{connectionId}', {
        params: {
          path: {connectionId: connectOutput.connectionId},
          query: {
            provider_config_key: connectOutput.providerConfigKey,
          },
        },
      })
      .then((r) => r.data as {credentials: {access_token: string}})

    return {
      connectionExternalId: extractId(connectOutput.connectionId)[2],
      settings: {
        oauth: nangoConnection,
      },
      triggerDefaultSync: true,
    }
  },

  sourceSync: ({instance: salesforce, streams, state}) => {
    async function* iterateEntities() {
      console.log('[salesforce] Starting sync', streams)
      if (streams['contact']) {
        let nextCursor = state.nextRecordsUrl ?? undefined

        // Fetch the fields dynamically from the describe endpoint
        const describeResponse = await salesforce.GET(
          '/sobjects/{sObject}/describe',
          {
            params: {
              path: {sObject: 'Contact'},
            },
          },
        )

        const fields = Array.from(
          new Set([
            'Id',
            'SystemModstamp',
            ...(describeResponse.data?.fields?.map((field) => field.name) ??
              []),
          ]),
        )
        const baseQuery = `SELECT ${fields.join(
          ', ',
        )} FROM Contact ORDER BY SystemModstamp ASC, Id ASC`

        while (true) {
          const response = nextCursor
            ? await salesforce.request('GET', `/query/${nextCursor}`)
            : ((await salesforce.query(baseQuery)) as any)

          nextCursor = response.data.nextRecordsUrl

          const contacts = response.data.records

          yield [
            ...contacts.map((contact: any) =>
              salesforceHelpers._opData('contact', contact.Id, contact),
            ),
            salesforceHelpers._opState({nextRecordsUrl: nextCursor}),
          ]

          if (!nextCursor) {
            break
          }
        }
      }
    }

    return rxjs
      .from(iterateEntities())
      .pipe(
        Rx.mergeMap((ops) =>
          rxjs.from([...ops, salesforceHelpers._op('commit')]),
        ),
      )
  },

  passthrough: (instance, input) =>
    instance.request(input.method, input.path, {
      headers: input.headers as Record<string, string>,
      params: {query: input.query},
      body: JSON.stringify(input.body),
    }),
} satisfies ConnectorServer<typeof salesforceSchemas, SalesforceSDK>

export default salesforceServer
