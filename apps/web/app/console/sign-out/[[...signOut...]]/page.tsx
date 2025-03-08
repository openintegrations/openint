'use client'

import {useRouter} from 'next/navigation'
import React from 'react'
import {useSession} from '@/lib-server/auth.client'

export default function SignOutScreen() {
  const session = useSession()
  const router = useRouter()
  // Sign out has to happen client side, though we could revoke session server side
  React.useEffect(() => {
    void session.signOut().then(() => {
      router.push('/console/sign-in')
    })
  }, [router, session])

  return <p>Signing out...</p>
}
