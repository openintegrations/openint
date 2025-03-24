'use client'

import {useRouter} from 'next/navigation'
import React from 'react'
import {FullScreenCenter} from '@/components/FullScreenCenter'
import {useSession} from '@/lib-client/auth.client'

export default function SignOutScreen() {
  const session = useSession()
  const router = useRouter()
  // Sign out has to happen client side, though we could revoke session server side
  React.useEffect(() => {
    void session.signOut().then(() => {
      router.push('/console/sign-in')
    })
  }, [router, session])

  return <FullScreenCenter>Signing out...</FullScreenCenter>
}
