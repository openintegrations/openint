import {redirect} from 'next/navigation'
import {SignUp} from '@openint/console-auth/client'
import {getBaseURLs} from '@openint/env'
import {FullScreenCenter} from '@openint/ui-v1/components/FullScreenCenter'
import {currentViewer} from '@/lib-server/auth.server'

export default async function SignInScreen() {
  const current = await currentViewer()
  if (current.viewer.role !== 'anon') {
    redirect('/console')
  }
  return (
    <FullScreenCenter>
      <SignUp
        signInUrl={getBaseURLs(null).console + '/sign-up'}
        signInForceRedirectUrl={getBaseURLs(null).console}
      />
    </FullScreenCenter>
  )
}
