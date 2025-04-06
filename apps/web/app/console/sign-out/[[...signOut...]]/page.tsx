'use client'

import React from 'react'
import {useSession} from '@openint/console-auth/client'
import {FullScreenCenter} from '@openint/ui-v1/components/FullScreenCenter'

export default function SignOutScreen() {
  const {signOut} = useSession()

  React.useEffect(() => {
    void signOut().then(() => {
      window.location.href = '/console/sign-in'
    })
  }, [signOut])

  return <FullScreenCenter>Signing out...</FullScreenCenter>
}
