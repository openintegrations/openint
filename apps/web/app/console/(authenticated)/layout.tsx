import {redirect} from 'next/navigation'
import React from 'react'
import {
  DynamicOrganizationSwitcher,
  DynamicUserButton,
} from '@openint/console-auth/client'
import {AppLayout} from '@openint/ui-v1'
import {currentViewer} from '@/lib-server/auth.server'
import {GlobalCommandBarProvider} from '../../../lib-client/GlobalCommandBarProvider'
import OnboardingHoc from './OnboardingHoc'
import {SIDEBAR_NAV_ITEMS} from './sidebar-nav-items'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {viewer} = await currentViewer()
  console.log('AuthenticatedLayout viewer', viewer)
  if (viewer.role !== 'user') {
    return redirect('/console/sign-in')
  }

  const shouldShowOnboarding = viewer.role === 'user' && !viewer.orgId
  return (
    <GlobalCommandBarProvider>
      <AppLayout
        navItems={SIDEBAR_NAV_ITEMS}
        organizationSwitcher={
          <DynamicOrganizationSwitcher hidePersonal={true} />
        }
        userButton={<DynamicUserButton showName />}>
        {shouldShowOnboarding ? <OnboardingHoc /> : children}
      </AppLayout>
    </GlobalCommandBarProvider>
  )
}
