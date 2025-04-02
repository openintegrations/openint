'use client'

import {useClerk} from '@clerk/nextjs'
import React from 'react'
import {FullScreenCenter} from '@/components/FullScreenCenter'

export default function SignOutScreen() {
  const {signOut} = useClerk()

  React.useEffect(() => {
    void signOut().then(() => {
      window.location.href = '/console/sign-in'
    })
  }, [signOut])

  return <FullScreenCenter>Signing out...</FullScreenCenter>
}
