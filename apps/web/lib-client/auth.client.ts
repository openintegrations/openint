// 'use client'

import {useClerk} from '@clerk/nextjs'
import React from 'react'

export {
  ClerkProvider as AuthProvider,
  SignIn,
  SignUp,
  OrganizationSwitcher,
  UserButton,
} from '@clerk/nextjs'

export type ClientSession = ReturnType<typeof useSession>

export function useSession() {
  const clerk = useClerk()

  return React.useMemo(
    () => ({
      signOut: () => clerk.signOut(),
    }),
    [clerk],
  )
}
