'use client'

import {
  useClerk,
  useSession as useClerkSession,
  useOrganization,
  useUser,
} from '@clerk/nextjs'
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
  const {user} = useUser()
  const {organization} = useOrganization()
  const {session, isLoaded} = useClerkSession()

  return React.useMemo(
    () => ({
      signOut: () => clerk.signOut(),
      userId: user?.id,
      orgId: organization?.id,
      sessionId: session?.id,
      isLoaded,
    }),
    [clerk, user, organization, session],
  )
}
