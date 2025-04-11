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
import {getBaseURLs} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {ConnectCallbackClient} from './page.client'

const zOauthCallbackSearchParams = z.object({
  code: z.string(),
  state: z.string(),
  // connector_name: z.enum(['hi', 'there']),
})

// TODO: Dedupe this with cnext
const zOauthState = z.object({
  connection_id: z.string(),
  redirect_uri: z.string().optional(),
})

export default async function ConnectCallback(pageProps: PageProps) {
  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zOauthCallbackSearchParams,
  })
  const state = zOauthState.parse(JSON.parse(searchParams.state))
  if (
    state.redirect_uri &&
    state.redirect_uri !== getBaseURLs(null).connect + '/callback'
  ) {
    const url = new URL(state.redirect_uri)
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value)
    }
    return redirect(url.toString())
  }

  return <ConnectCallbackClient data={searchParams} />
}
