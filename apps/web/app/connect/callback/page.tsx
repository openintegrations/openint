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

import {z} from '@openint/util/zod-utils'
import type {PageProps} from '@/lib-common/next-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {ConnectCallbackClient} from './page.client'

const zOauthCallbackSearchParams = z.object({
  code: z.string(),
  state: z.string(),
})

export default async function ConnectCallback(pageProps: PageProps) {
  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: zOauthCallbackSearchParams,
  })

  return <ConnectCallbackClient data={searchParams} />
}
