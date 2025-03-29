import {redirect} from 'next/navigation'
import React from 'react'
import {AppLayout} from '@openint/ui-v1'
import {OrganizationSwitcher, UserButton} from '@/lib-client/auth.client'
import {currentViewer} from '@/lib-server/auth.server'
import {GlobalCommandBarProvider} from '../../GlobalCommandBarProvider'
import {ClientApp} from './client'

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

  return (
    <ClientApp token={token}>
      <GlobalCommandBarProvider>
        <AppLayout
          organizationSwitcher={<OrganizationSwitcher />}
          userButton={<UserButton showName />}>
          {children}
        </AppLayout>
      </GlobalCommandBarProvider>
    </ClientApp>
  )
}
