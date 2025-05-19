import type {PageProps} from '@/lib-common/next-utils'

import {redirect} from 'next/navigation'
import {getConnectorModelByName} from '@openint/api-v1/models'
import {routerContextFromViewer} from '@openint/api-v1/trpc/context'
import {onError} from '@openint/api-v1/trpc/error-handling'
import {connectRouter} from '@openint/api-v1/trpc/routers/connect'
import {createCustomerViewer, extractId, Id, zCustomerId} from '@openint/cdk'
import {
  zOauthCallbackSearchParams,
  zOauthState,
} from '@openint/cnext/auth-oauth2/schemas'
import {resolveRoute} from '@openint/env'
import {prettyConnectorName} from '@openint/ui-v1/utils'
import {Z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {db} from '@/lib-server/globals'
import {CloseWindowClient} from './closeWindow.client'

export default async function ConnectCallback(pageProps: PageProps) {
  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zOauthCallbackSearchParams,
  })

  const state = zOauthState.parse(JSON.parse(searchParams.state))
  if (
    state.redirect_uri &&
    // TODO: Normalize the redirect_uri to account for final `/` differences
    // See https://github.com/openintegrations/openint/blob/48b207376157259c0a3d0bf66fde9ee1d91e6336/connectors/cnext/auth-oauth2/createOAuth2ConnectorServer.ts#L86

    // TODO: Stop constructing URLs in not typesafe way...
    state.redirect_uri !==
      new URL(...resolveRoute('/connect/callback', null)).toString()
  ) {
    const url = new URL(state.redirect_uri)
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }
    return redirect(url.toString())
  }

  const connector = getConnectorModelByName(
    extractId(state.connection_id as Id['conn'])[1],
  )

  if (!connector) {
    return (
      <div>
        Connector not found. Contact your administrator if this error persists.
      </div>
    )
  }

  try {
    const ctx = routerContextFromViewer({
      db,
      viewer: createCustomerViewer({
        orgId: state.org_id as Id['org'],
        customerId: state.customer_id as any as Z.infer<typeof zCustomerId>,
      }),
    })
    const caller = connectRouter.createCaller(ctx, {onError})

    await caller.postConnect({
      connector_config_id: state.connector_config_id,
      options: {},
      discriminated_data: {
        connector_name: connector.name,
        connect_output: searchParams,
      },
    })
    return (
      <CloseWindowClient
        connectorName={
          connector.display_name || prettyConnectorName(connector.name)
        }
        // NOTE: in future potentially add error parsing here? albeit may not be part of the spec redirect_uri use...
        // error={searchParams.error}
      />
    )
  } catch (error) {
    return (
      <div>
        <h1>There was an Error adding your connection</h1>
        <p>Please try again or contact support.</p>
        <pre>{error instanceof Error ? error.message : ''}</pre>
      </div>
    )
  }
}
