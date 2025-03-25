import {redirect} from 'next/navigation'
import {FullScreenCenter} from '@/components/FullScreenCenter'
import {CloseWindowScript} from './CloseWindowScript'

/**
 * Workaround for searchParams being empty on production. Will have to check
 * @see https://github.com/vercel/next.js/issues/43077#issuecomment-1383742153
 */
export const dynamic = 'force-dynamic'

/** https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional */
export default async function OAuthCallback({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}) {
  const {code, state} = await searchParams

  if (code && state) {
    // Just close the window - parent that opens this in a popup after redirect will read params directly
    // state in connection new is the base64 of the connection ID. In the future, this will change to a more secure string
    const isNewState = Buffer.from(state as string, 'base64')
      .toString('utf8')
      .startsWith('conn_')

    if (isNewState) {
      // We can't close the window server-side, so we'll need client-side JS for this
      // Return a minimal client component that will close the window
      // TODO: @pellicceama handle token exchange server side via postConnect here rather than
      // passing the code to the client for call postConnect in a separate roundtrip

      return <CloseWindowScript />
    } else {
      const url = new URL('https://api.nango.dev/oauth/callback')
      for (const [key, value] of Object.entries(searchParams)) {
        if (typeof value === 'string') {
          url.searchParams.append(key, value)
        }
      }
      return redirect(url.toString())
    }
  }

  return (
    <FullScreenCenter>
      <span className="mb-2">Processing authentication...</span>
    </FullScreenCenter>
  )
}
