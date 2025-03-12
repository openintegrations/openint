'use client'

import {
  OrganizationSwitcher,
  useAuth,
  useOrganizationList,
  UserButton,
} from '@clerk/nextjs'
import NextTopLoader from 'nextjs-toploader'
import {FormEventHandler, useState} from 'react'
import {_trpcReact, LoadingSpinner} from '@openint/engine-frontend'
import {Button} from '@openint/ui/shadcn/Button'
import {Input} from '@openint/ui/shadcn/Input'
import {NoSSR} from '@/components/NoSSR'
import {RedirectToNext13} from '@/components/RedirectTo'
import {VCommandBar} from '@/vcommands/vcommand-components'
import {Sidebar} from './Sidebar'

function CustomCreateOrganization() {
  const {createOrganization, setActive} = useOrganizationList()
  const [organizationName, setOrganizationName] = useState('')
  // const [referralSource, setReferralSource] = useState('')

  if (!createOrganization || !setActive) {
    return null
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const newOrg = await createOrganization({
      name: organizationName,
      // note: this does not seem to be working..
      // TODO: Fix & Enable
      // publicMetadata: {
      //   referralSource,
      // },
    })
    if (newOrg) {
      await setActive({organization: newOrg.id})
    }
    window.location.href = '/'
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-md mt-2">What is your organization name?</p>
      <Input
        type="text"
        name="organizationName"
        value={organizationName}
        placeholder="e.g. Acme Corp"
        onChange={(e) => setOrganizationName(e.currentTarget.value)}
      />
      {/* <p className="text-md mt-2">How did you hear about us?</p>
      <Input
        type="text"
        name="referralSource"
        value={referralSource}
        placeholder="e.g. Twitter"
        onChange={(e) => setReferralSource(e.currentTarget.value)}
      /> */}
      <Button type="submit" className="mt-4">
        Create organization
      </Button>
    </form>
  )
}

export default function AuthedLayout({children}: {children: React.ReactNode}) {
  // Clerk react cannot be trusted... Add our own clerk listener instead...
  // auth works for initial request but then subsequently breaks...
  const auth = useAuth()
  if (!auth.isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (auth.isLoaded && !auth.isSignedIn) {
    return <RedirectToNext13 url="/dashboard/sign-in" />
  }

  if (!auth.orgId) {
    return (
      <div className="flex h-screen w-screen flex-col">
        <h1>Welcome to OpenInt!</h1>
        <CustomCreateOrganization />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <NextTopLoader showSpinner={false} />
      <VCommandBar />
      {/* max-h-[calc(100vh-3em)] should normally not be needed, but otherwise
      layout on sql page doesn't work when results are long :( donno how to prevent
      it otherwise without setting overflow hidden prop */}
      <main className="ml-[240px] mt-12 max-h-[calc(100vh-3em)] grow overflow-x-hidden bg-background">
        {children}
      </main>
      <Sidebar className="fixed bottom-0 left-0 top-12 w-[240px] border-r bg-sidebar" />
      <header className="fixed inset-x-0 top-0 flex h-12 items-center gap-2 border-b bg-navbar p-4">
        {/* Not working because of bug in clerk js that is unclear that results in hydration issue.. */}
        <NoSSR>
          <div className="mb-[-6px]">
            {/* Compensate for mysterious 6px bottom padding not explainable */}
            <OrganizationSwitcher hidePersonal />
          </div>
          {/* <TopLav /> */}
          <div className="grow" /> {/* Spacer */}
          <UserButton showName />
        </NoSSR>
      </header>
    </div>
  )
}
