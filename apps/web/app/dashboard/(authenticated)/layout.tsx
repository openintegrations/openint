'use client'

import {
  OrganizationSwitcher,
  useAuth,
  useOrganizationList,
  UserButton,
} from '@clerk/nextjs'
import NextTopLoader from 'nextjs-toploader'
import {FormEventHandler, useState} from 'react'
import {_trpcReact} from '@openint/engine-frontend'
import {Button} from '@openint/shadcn/ui/button'
import {Input} from '@openint/shadcn/ui/input'
import {NoSSR} from '@/components/NoSSR'
import {RedirectToNext13} from '@/components/RedirectTo'
import {VCommandBar} from '@/vcommands/vcommand-components'
import {Sidebar} from './Sidebar'

function CustomCreateOrganization({clerkUserId}: {clerkUserId?: string}) {
  const {createOrganization, setActive} = useOrganizationList()
  const [organizationName, setOrganizationName] = useState('')
  // const [referralSource, setReferralSource] = useState('')

  // Move the mutation hook to the top level of the component
  const createOrgMutation = _trpcReact.createOrganization.useMutation()

  if (!createOrganization || !setActive) {
    return null
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const newOrg = await createOrganization({
      name: organizationName,
    })

    if (newOrg) {
      // Use the mutation from the top-level hook
      createOrgMutation.mutate(
        {
          id: newOrg.id,
          name: organizationName,
          // referrer: 'web', // TODO: add referrer from form
          clerkUserId: clerkUserId ?? '',
        },
        {
          onSuccess: async (data) => {
            if (data.id && data.id == newOrg.id) {
              await setActive({organization: data.id})
              setTimeout(() => {
                window.location.href = '/'
              }, 1000)
            } else {
              console.error(
                'Failed to create organization, please try again later with a different name',
              )
            }
          },
        },
      )
    }
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
        <CustomCreateOrganization clerkUserId={auth.userId} />
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
      <main className="bg-background ml-[240px] mt-12 max-h-[calc(100vh-3em)] grow overflow-x-hidden">
        {children}
      </main>
      <Sidebar className="bg-sidebar fixed bottom-0 left-0 top-12 w-[240px] border-r" />
      <header className="bg-navbar fixed inset-x-0 top-0 flex h-12 items-center gap-2 border-b p-4">
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
