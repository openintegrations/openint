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
import {
  zOauthCallbackSearchParams,
  zOauthState,
} from '@openint/cnext/auth-oauth2/schemas'
import {isProduction, resolveRoute} from '@openint/env'
import {parsePageProps} from '@/lib-common/next-utils'
import {ConnectCallbackClient} from './page.client'

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
  const isAcme = state.connection_id.startsWith('conn_acme')

  return (
    <ConnectCallbackClient
      data={searchParams}
      debug={!isProduction || isAcme}
    />
  )
}
