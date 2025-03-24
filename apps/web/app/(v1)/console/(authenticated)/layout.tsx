import React from 'react'
import {SidebarInset, SidebarProvider} from '@openint/shadcn/ui/sidebar'
import {AppHeader} from './app-header'
import {AppSidebar} from './app-sidebar'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
