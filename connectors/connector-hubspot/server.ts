import {initHubspotSDK, type HubspotSDK} from '@opensdks/sdk-hubspot'
import {initNangoSDK, type ConnectorServer} from '@openint/cdk'
import {Rx, rxjs} from '@openint/util'
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

    const _instance = initHubspotSDK({
      headers: {
        authorization: `Bearer ${nangoConnection.credentials.access_token}`,
      },
    })
    const accountInfo = await _instance.crm_objects
      .request('GET', '/integrations/v1/me', {})
      .then((r) => r.data as {portalId: string})
    return {
      resourceExternalId: accountInfo.portalId,
      settings: {
        oauth: nangoConnection,
      },
      triggerDefaultSync: true,
    }
  },
  // @ts-expect-error QQ why is typing failing here?
  sourceSync: ({instance: hubspot, streams, state}) => {
    async function* iterateEntities() {
      console.log('[hubspot] Starting sync', streams)
      for (const type of Object.values(HUBSPOT_ENTITIES)) {
        if (!streams[type]) {
          continue
        }

        if (streams['contact']) {
          const response = await hubspot.crm_contacts.GET(
            '/crm/v3/objects/contacts',
            {
              params: {
                query: {
                  limit: 100, // TODO: Make this dynamic?
                  after: state.contactSyncCursor ?? undefined,
                },
              },
            },
          )

          const contacts = response.data.results
          const nextCursor = response.data.paging?.next?.after

          yield [
            ...contacts.map((contact) => ({
              type: 'data' as any,
              data: {
                entityName: 'contact',
                id: contact.id,
                entity: contact as Record<string, unknown>,
              },
            })),
            // QQ: is this how we want to handle state?
            hubspotHelpers._opState({contactSyncCursor: nextCursor}),
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
