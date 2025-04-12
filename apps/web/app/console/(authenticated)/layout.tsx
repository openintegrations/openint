import {redirect} from 'next/navigation'
import React from 'react'
import {OrganizationSwitcher, UserButton} from '@openint/console-auth/client'
import {AppLayout} from '@openint/ui-v1'
import {currentViewer} from '@/lib-server/auth.server'
import {GlobalCommandBarProvider} from '../../GlobalCommandBarProvider'
import {ClientApp} from './client'
import OnboardingHoc from './onboarding'
import {SIDEBAR_NAV_ITEMS} from './sidebar-nav-items'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {viewer, token = ''} = await currentViewer()
  console.log('AuthenticatedLayout viewer', viewer)
  if (viewer.role !== 'user') {
    return redirect('/console/sign-in')
  }

  const shouldShowOnboarding = viewer.role === 'user' && !viewer.orgId
  return (
    <ClientApp token={token}>
      <GlobalCommandBarProvider>
        <AppLayout
          navItems={SIDEBAR_NAV_ITEMS}
          organizationSwitcher={<OrganizationSwitcher hidePersonal={true} />}
          userButton={<UserButton showName />}>
          {shouldShowOnboarding ? <OnboardingHoc /> : children}
        </AppLayout>
      </GlobalCommandBarProvider>
    </ClientApp>
  )
}
