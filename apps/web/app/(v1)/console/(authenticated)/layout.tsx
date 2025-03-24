import React from 'react'
import {AppLayout} from '@openint/ui-v1'
import {OrganizationSwitcher, UserButton} from '@/lib-client/auth.client'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout
      organizationSwitcher={<OrganizationSwitcher />}
      userButton={<UserButton showName />}>
      {children}
    </AppLayout>
  )
}
