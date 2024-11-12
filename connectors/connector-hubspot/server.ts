import {initHubspotSDK, type HubspotSDK} from '@opensdks/sdk-hubspot'
import {initNangoSDK, type ConnectorServer} from '@openint/cdk'
import {makeUlid, Rx, rxjs} from '@openint/util'
import {HUBSPOT_ENTITIES, hubspotHelpers, type hubspotSchemas} from './def'

export const hubspotServer = {
  newInstance: ({fetchLinks, settings}) =>
    initHubspotSDK({
      headers: {
        authorization: `Bearer ${settings.oauth.credentials.access_token}`,
      },
      links: (defaultLinks) => [...fetchLinks, ...defaultLinks],
    }),

  checkResource: async ({instance, settings}) => {
    // Fix me hubspot workaround ....
    // https://developers.hubspot.com/docs/api/settings/account-information-api
    const res = await instance!.crm_objects.request(
      'GET',
      '/account-info/v3/details',
      {},
    )
    // https://legacydocs.hubspot.com/docs/methods/get-account-details
    const res2 = await instance!.crm_objects.request(
      'GET',
      '/integrations/v1/me',
      {},
    )
    // https://community.hubspot.com/t5/APIs-Integrations/Get-HubsPot-account-name-by-portalId-from-API/m-p/280013
    const res3 = await instance!.auth_oauth.GET('/v1/access-tokens/{token}', {
      params: {path: {token: settings.oauth.credentials.access_token!}},
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      settings: {
        extra: {accountInfo: res.data, me: res2.data, tokenInfo: res3.data},
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  },
  // TODO enable this once we look into the data model of connectOutput
  // and map most appropriate response for hubspot
  postConnect: async (connectOutput, config, context) => {
    console.log('hubspot postConnect input:', {
      connectOutput,
      config,
      context,
    })
    // TODO: pass this context in via postConnect?
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

    // note: this used to have the hubspot account portal Id but that
    // wouldn't allow integrating that account against other oint instances
    // in future we should have the external id as a separate column
    // and enforce constraints that way

    return {
      resourceExternalId: makeUlid(),
      settings: {
        oauth: nangoConnection,
      },
      triggerDefaultSync: true,
    }
  },

  sourceSync: ({instance: hubspot, streams, state}) => {
    async function* iterateEntities() {
      console.log('[hubspot] Starting sync', streams)
      for (const type of Object.values(HUBSPOT_ENTITIES)) {
        if (!streams[type]) {
          continue
        }

        if (streams['contact']) {
          let nextCursor = state.contactSyncCursor ?? undefined

          while (true) {
            const response = await hubspot.crm_contacts.GET(
              '/crm/v3/objects/contacts',
              {
                params: {
                  query: {
                    limit: 100, // TODO: Make this dynamic?
                    after: nextCursor,
                  },
                },
              },
            )

            const contacts = response.data.results
            nextCursor = response.data.paging?.next?.after

            // console.log(
            //   `[hubspot] Fetching contacts with cursor: ${nextCursor}`,
            // )
            yield [
              ...contacts.map((contact) =>
                hubspotHelpers._opData('contact', contact.id, contact),
              ),
              hubspotHelpers._opState({contactSyncCursor: nextCursor}),
            ]

            if (!nextCursor) {
              break
            }
          }
        }
      }
    }

    return rxjs
      .from(iterateEntities())
      .pipe(
        Rx.mergeMap((ops) => rxjs.from([...ops, hubspotHelpers._op('commit')])),
      )
  },

  // passthrough: (instance, input) =>
  //   instance.request(input.method, input.path, {
  //     headers: input.headers as Record<string, string>,
  //     params: {query: input.query},
  //     body: JSON.stringify(input.body),
  //   }),
} satisfies ConnectorServer<typeof hubspotSchemas, HubspotSDK>

export default hubspotServer
