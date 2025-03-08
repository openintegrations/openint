'use client'

import {FullScreenCenter} from '@/components/FullScreenCenter'
import {SignIn} from '@/lib-server/auth.client'

export default function SignInScreen() {
  return (
    <FullScreenCenter>
      <SignIn signUpUrl="/console/sign-up" signUpForceRedirectUrl="/console" />
    </FullScreenCenter>
  )
}
