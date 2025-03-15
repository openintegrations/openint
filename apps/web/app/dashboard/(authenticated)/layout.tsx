'use client'

import {
  OrganizationSwitcher,
  useAuth,
  useOrganizationList,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import {UseMutateFunction} from '@tanstack/react-query'
import router from 'next/router'
import NextTopLoader from 'nextjs-toploader'
import {_trpcReact, LoadingSpinner} from '@openint/engine-frontend'
import {OnboardingModal} from '@openint/ui-v1'
import {NoSSR} from '@/components/NoSSR'
import {RedirectToNext13} from '@/components/RedirectTo'
import {VCommandBar} from '@/vcommands/vcommand-components'
import {Sidebar} from './Sidebar'

async function createOrganizationMutationWrapper({
  name,
  clerkUserId,
  createOrgBackendMutation,
  createOrgClerkMutation,
  setActiveClerkOrganization,
}: {
  name: string
  clerkUserId: string
  createOrgBackendMutation: UseMutateFunction<
    {
      clerkUserId: string
      name: string
      id: string
      referrer?: string | null | undefined
    },
    Error,
    {
      clerkUserId: string
      name: string
      id: string
      referrer?: string | null | undefined
    },
    unknown
  >
  createOrgClerkMutation: () => Promise<{id: string}>
  setActiveClerkOrganization: (organizationId: string) => void
}) {
  return new Promise<void>(async (resolve, reject) => {
    const newOrg = await createOrgClerkMutation()
    if (!newOrg) {
      reject(new Error('Failed to create organization'))
      return
    }

    await createOrgBackendMutation(
      {
        id: newOrg.id,
        name,
        // referrer: 'web', // TODO: add referrer from form
        clerkUserId: clerkUserId ?? '',
      },
      {
        onSuccess: async (data) => {
          if (data.id && data.id == newOrg.id) {
            await setActiveClerkOrganization(data.id)
            resolve()
            // setTimeout(() => {
            //   window.location.href = '/'
            // }, 1000)
          } else {
            reject(
              new Error(
                'Failed to create organization, please try again later with a different name',
              ),
            )
          }
        },
      },
    )
  })
}

export default function AuthedLayout({children}: {children: React.ReactNode}) {
  // Clerk react cannot be trusted... Add our own clerk listener instead...
  // auth works for initial request but then subsequently breaks...
  const auth = useAuth()
  const user = useUser()
  const {mutate: createOrgBackendMutation} =
    _trpcReact.createOrganization.useMutation()
  const {
    createOrganization: createOrgClerkMutation,
    setActive: setActiveClerkOrganization,
  } = useOrganizationList()

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

  if (!auth.orgId && user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <OnboardingModal
          className="w-[500px] max-w-[90%]"
          createOrganization={(name: string) =>
            createOrganizationMutationWrapper({
              name,
              clerkUserId: auth.userId,
              createOrgBackendMutation: createOrgBackendMutation as any,
              createOrgClerkMutation: createOrgClerkMutation as any,
              setActiveClerkOrganization: (organizationId: string) => {
                setActiveClerkOrganization?.({
                  organization: organizationId,
                })
              },
            })
          }
          navigateTo={(action, connectorType) => {
            switch (action) {
              case 'listConnectors':
              case 'dashboard':
              case 'setupConnector':
              default: {
                console.log('TODO: handle', action, connectorType)
                // TODO: handle
                router.push('/dashboard')
              }
            }
          }}
          userFirstName={user?.user?.firstName ?? undefined}
          email={user?.user?.emailAddresses?.[0]?.emailAddress}
        />
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
