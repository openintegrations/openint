import {redirect} from 'next/navigation'
import {SignUp} from '@openint/console-auth/client'
import {FullScreenCenter} from '@openint/ui-v1/components/FullScreenCenter'
import {resolveLinkPath} from '@/lib-common/Link'
import {currentViewer} from '@/lib-server/auth.server'

export default async function SignInScreen() {
  const current = await currentViewer()
  if (current.viewer.role !== 'anon') {
    redirect('/console')
  }
  return (
    <FullScreenCenter>
      <SignUp
        signInUrl={resolveLinkPath('/console/sign-in/')}
        signInForceRedirectUrl={resolveLinkPath('/console')}
      />
    </FullScreenCenter>
  )
}
