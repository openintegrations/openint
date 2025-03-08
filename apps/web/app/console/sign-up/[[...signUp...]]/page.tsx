'use client'

import {FullScreenCenter} from '@/components/FullScreenCenter'
import {SignUp} from '@/lib-server/auth.client'

export default function SignInScreen() {
  return (
    <FullScreenCenter>
      <SignUp signInUrl="/console/sign-in" signInForceRedirectUrl="/console" />
    </FullScreenCenter>
  )
}
