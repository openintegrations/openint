import {redirect} from 'next/navigation'
import {FullScreenCenter} from '@openint/ui-v1/components/FullScreenCenter'
import {SignIn} from '@openint/console-auth/client'
import {currentViewer} from '@/lib-server/auth.server'

export default async function SignInScreen() {
  const current = await currentViewer()
  if (current.viewer.role !== 'anon') {
    redirect('/console')
  }
  return (
    <FullScreenCenter>
      <SignIn signUpUrl="/console/sign-up" forceRedirectUrl="/console" />
    </FullScreenCenter>
  )
}
