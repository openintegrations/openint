'use client'

import {useSearchParams} from 'next/navigation'
import {useEffect} from 'react'
import {FullScreenCenter} from '@/components/FullScreenCenter'

/**
 * Workaround for searchParams being empty on production. Will ahve to check
 * @see https://github.com/vercel/next.js/issues/43077#issuecomment-1383742153
 */
export const dynamic = 'force-dynamic'

/** https://beta.nextjs.org/docs/api-reference/file-conventions/page#searchparams-optional */
export default function OAuthCallback() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  useEffect(() => {
    if (
      code &&
      state &&
      Buffer.from(state, 'base64').toString('utf8').startsWith('conn_')
    ) {
      // Just close the window - parent that opens this in a popup after redirect will read params directly
      window.close()
    }
  }, [code, state])

  console.log('New OAuthCallback', {code, state})
  return (
    <FullScreenCenter>
      <span className="mb-2">Processing authentication...</span>
    </FullScreenCenter>
  )
}
