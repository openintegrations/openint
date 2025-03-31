import {createClerkClient} from '@clerk/nextjs/server'
import {env} from '@openint/env'

const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

export async function resetClerkTestData() {
  const orgs = await clerkClient.organizations.getOrganizationList({limit: 100})
  for (const org of orgs.data) {
    if (
      org.name.toLowerCase().includes('qa') ||
      org.name.toLowerCase().includes('test')
    ) {
      await clerkClient.organizations.deleteOrganization(org.id)
    }
  }
  const users = await clerkClient.users.getUserList({limit: 100})
  for (const user of users.data) {
    if (user.firstName?.includes('Test')) {
      await clerkClient.users.deleteUser(user.id)
    }
  }
}
