import {redirect} from 'next/navigation'
import {FullScreenCenter} from '@openint/ui-v1/components/FullScreenCenter'
import {SignUp} from '@openint/console-auth/client'
import {currentViewer} from '@/lib-server/auth.server'

export default async function SignInScreen() {
  const current = await currentViewer()
  if (current.viewer.role !== 'anon') {
    redirect('/console')
  }
  return (
    <FullScreenCenter>
      <SignUp signInUrl="/console/sign-in" signInForceRedirectUrl="/console" />
    </FullScreenCenter>
  )
}
