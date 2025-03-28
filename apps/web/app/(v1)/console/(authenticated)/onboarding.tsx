import {useAuth, useOrganizationList, useUser} from '@clerk/nextjs'
import {useRouter} from 'next/router'
import {OnboardingModal} from '@openint/ui-v1'
import {useMutation} from '@openint/ui-v1/trpc'
import {useTRPC} from './client'

export default function OnboardingHoc() {
  const auth = useAuth()
  const user = useUser()
  const router = useRouter()
  const trpc = useTRPC()

  const createOrgBackendMutation = useMutation(
    trpc.createOrganization.mutationOptions(),
  )
  const {
    createOrganization: createOrgClerkMutation,
    setActive: setActiveClerkOrganization,
  } = useOrganizationList()

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <OnboardingModal
        className="w-[500px] max-w-[90%]"
        createOrganization={(organizationName) =>
          createOrganizationMutationWrapper({
            organizationName,
            clerkUserId: auth.userId ?? '',
            createOrgBackendMutation: (input) =>
              createOrgBackendMutation.mutateAsync(input),
            createOrgClerkMutation: createOrgClerkMutation as any,
            setActiveClerkOrganization: (organizationId: string) => {
              setActiveClerkOrganization?.({
                organization: organizationId,
              })
            },
          })
        }
        navigateTo={(action, connectorName) => {
          switch (action) {
            case 'setupConnector':
            // this in case the user selects a connector from the top 3 list. Hence a connectorType is provided
            case 'listConnectors':
            // this is in case the user selects they want to add a connector that's not in the top 3 list.
            case 'dashboard':
            // This is in case the user closes the modal, same as default case
            default: {
              console.log('TODO: handle', action, connectorName)
              // TODO: handle
              router.push('/')
              break
            }
          }
        }}
        userFirstName={user?.user?.firstName ?? undefined}
        email={user?.user?.emailAddresses?.[0]?.emailAddress}
      />
    </div>
  )
}

async function createOrganizationMutationWrapper({
  organizationName,
  clerkUserId,
  createOrgBackendMutation,
  createOrgClerkMutation,
  setActiveClerkOrganization,
}: {
  organizationName: string
  clerkUserId: string
  createOrgBackendMutation: (input: any) => Promise<{id: string}>
  createOrgClerkMutation: (options: any) => Promise<{id: string}>
  setActiveClerkOrganization: (organizationId: string) => void
}) {
  return new Promise<void>(async (resolve, reject) => {
    const newOrg = await createOrgClerkMutation({
      name: organizationName,
    })
    if (!newOrg) {
      reject(new Error('Failed to create organization'))
      return
    }

    try {
      const res = await createOrgBackendMutation({
        id: newOrg.id,
        name: organizationName,
        // referrer: 'web', // TODO: add referrer from form
        clerkUserId: clerkUserId ?? '',
      })
      await setActiveClerkOrganization(res.id)
      resolve()
    } catch (error) {
      reject(
        new Error(
          'Failed to create organization, please try again later with a different name',
        ),
      )
    }
  })
}
