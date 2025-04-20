'use client'

import {
  OrganizationSwitcher as ClerkOrganizationSwitcher,
  UserButton as ClerkUserButton,
  useClerk,
  useSession as useClerkSession,
  useOrganization,
  useUser,
} from '@clerk/nextjs'
import {dark as darkTheme} from '@clerk/themes'
import dynamic from 'next/dynamic'
import React from 'react'
import {getBaseURLs} from '@openint/env'
import {useTheme} from '@openint/ui-v1/components/ThemeProvider'

export {
  ClerkProvider as AuthProvider,
  /** TODO: Move these to noSsr also to avoid hydration errors */
  SignIn,
  /** TODO: Move these to noSsr also to avoid hydration errors */
  SignUp,
  /** @deprecated use useSession instead */
  useAuth,
  useOrganization,
  useOrganizationList,
  /** @deprecated use useSession instead */
  useUser,
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
    [
      user?.id,
      organization?.id,
      organization?.name,
      organization?.imageUrl,
      session?.id,
      isLoaded,
      clerk,
    ],
  )
}

const DynamicOrganizationSwitcher = dynamic(
  () => Promise.resolve(ClerkOrganizationSwitcher),
  {ssr: false},
)

const DynamicUserButton = dynamic(() => Promise.resolve(ClerkUserButton), {
  ssr: false,
})

export function OrganizationSwitcher() {
  const {isDark} = useTheme()
  return (
    <DynamicOrganizationSwitcher
      hidePersonal={true}
      appearance={{baseTheme: isDark ? darkTheme : undefined}}
    />
  )
}

export function UserButton() {
  const {isDark} = useTheme()
  return (
    <DynamicUserButton
      showName
      appearance={{baseTheme: isDark ? darkTheme : undefined}}
      signInUrl={getBaseURLs(null).console + '/sign-in'}
    />
  )
}
