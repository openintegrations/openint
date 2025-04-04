import React from 'react'
import {SidebarInset, SidebarProvider} from '@openint/shadcn/ui/sidebar'
import {AppHeader} from './app-header'
import {AppSidebar} from './app-sidebar'

export function AppLayout({
  children,
  userButton,
  organizationSwitcher,
}: {
  children: React.ReactNode
  userButton: React.ReactNode
  organizationSwitcher: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar organizationSwitcher={organizationSwitcher} />
      <SidebarInset className="max-h-dvh">
        <AppHeader userButton={userButton} />
        <main className="flex flex-1 flex-col gap-4 overflow-scroll p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
