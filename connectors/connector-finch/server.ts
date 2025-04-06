import type {FinchSDK, FinchSDKTypes} from '@opensdks/sdk-finch'
import {initFinchSDK} from '@opensdks/sdk-finch'
import type {ConnectorServer} from '@openint/cdk'
import type {finchSchemas} from './def'

type Finch = FinchSDKTypes['oas']['components']['schemas']
export const finchServer = {
  // Connect

  // eslint-disable-next-line @typescript-eslint/require-await
  preConnect: async ({config}) => ({
    client_id: config.client_id,
    products: config.products,
  }),
  postConnect: async ({connectOutput, config}) => {
    const finch = initFinchSDK({
      headers: {
        'FINCH-API-VERSION': config.api_version ?? '2020-09-17',
      },
    })
    const res = await finch.POST('/auth/token', {
      params: {header: {'Content-Type': 'application/json'}},
      body: {
        client_id: config.client_id,
        client_secret: config.client_secret,
        code: connectOutput.code,
      },
    })
    const companyId =
      (res.data as Finch['GetIntrospectResponse']).company_id ??
      (await finch.GET('/introspect').then((r) => r.data.company_id))
    // TODO: figure out if accountId is needed for connectionExternalId
    // Further, do not have a constraint on connectionExternalId...
    if (!companyId) {
      throw new Error('Missing company_id for Finch')
    }
    // We should really validate at the router layer.
    return {
      connectionExternalId: companyId,
      settings: {access_token: res.data.access_token},
    }
  },
  newInstance: ({settings, fetchLinks}) => {
    const sdk = initFinchSDK({
      headers: {
        authorization: `Bearer ${settings.access_token}`,
      },
      links: (defaultLinks) => [...fetchLinks, ...defaultLinks],
    })
    return sdk
  },
  revokeConnection: async ({instance}) => {
    await instance.POST('/disconnect')
  },
} satisfies ConnectorServer<typeof finchSchemas, FinchSDK>

export default finchServer
