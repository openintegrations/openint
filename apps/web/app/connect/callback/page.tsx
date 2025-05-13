// TODO: Consider moving to /connect/oauth2/callback to be more future proof around handing other protocols

/**
 *
 * render a page, with loading indicator
 *
 * parse the url params containing code and state
 *  - in future, directly call post connect with the code and state
 *
 * return code and state to the client via message pasing, then close the popup
 *  - in future, return simply the postConnectResult to the client then close popup
 *    bypassing the additional round trip of making a postConnect call client side
 *
 *
 *
 * All this logic technically belong in cnext but it's a bit tricky
 * Perhaps we can start with at least a re-export
 *
 * Will need to implement a custom useConnectFn hook and make sure the logic is
 * co-located together
 */

import type {PageProps} from '@/lib-common/next-utils'

import {redirect} from 'next/navigation'
import {getConnectorModelByName} from '@openint/api-v1/models'
import {routerContextFromViewer} from '@openint/api-v1/trpc/context'
import {onError} from '@openint/api-v1/trpc/error-handling'
import {connectRouter} from '@openint/api-v1/trpc/routers/connect'
import {createCustomerViewer, Id, zCustomerId} from '@openint/cdk'
import {
  zOauthCallbackSearchParams,
  zOauthState,
} from '@openint/cnext/auth-oauth2/schemas'
import {resolveRoute} from '@openint/env'
import {prettyConnectorName} from '@openint/ui-v1/utils'
import {Z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {db} from '@/lib-server/globals'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {CloseWindowClient} from './closeWindow.client'

export default async function ConnectCallback(pageProps: PageProps) {
  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zOauthCallbackSearchParams,
  })

  const {viewer, token} = await getServerComponentContext(pageProps)

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
    state.connection_id.split('_')[1] ?? '',
  )

  if (!connector) {
    return (
      <div>
        Connector not found. Contact your administrator if this error persists.
      </div>
    )
  }

  try {
    console.log('token33', token)
    console.log('viewer33', viewer)
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
        <h1>There was an Error handling the oauth callback</h1>
        <pre>{error.message}</pre>
      </div>
    )
  }

  // const isAcme = state.connection_id.startsWith('conn_acme')

  // server side call postConnect
  // change NativeOauthConnectorClientComponent to call onConnectFn with empty data
  // return (
  //   <ConnectCallbackClient
  //     data={searchParams}
  //     debug={!isProduction || isAcme}
  //   />
  // )
}
