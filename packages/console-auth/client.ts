'use client'

import {
  OrganizationSwitcher,
  useClerk,
  useSession as useClerkSession,
  useOrganization,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import React from 'react'

export {
  ClerkProvider as AuthProvider,
  /** TODO: Move these to noSsr also to avoid hydration errors */
  SignIn,
  /** TODO: Move these to noSsr also to avoid hydration errors */
  SignUp,
  useOrganization,
  useOrganizationList,
  /** @deprecated use useSession instead */
  useUser,
  /** @deprecated use useSession instead */
  useAuth,
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
      organizationName: organization?.name,
      organizationImageUrl: organization?.imageUrl,
    }),
    [clerk, user, organization, session],
  )
}

export const DynamicOrganizationSwitcher = dynamic(
  () => Promise.resolve(OrganizationSwitcher),
  {ssr: false},
)

export const DynamicUserButton = dynamic(() => Promise.resolve(UserButton), {
  ssr: false,
})
