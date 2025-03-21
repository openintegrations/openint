import {createClerkClient} from '@clerk/nextjs/server'
import type {Id, Viewer} from '@openint/cdk'
import {env} from '@openint/env'
import {getOrCreateApikey} from '../lib-server/procedures'

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

export async function setupTestOrg() {
  const testId = new Date()
    .toISOString()
    .replaceAll(/[\.Z:-]/g, '')
    .replace('T', '_')
  const user = await clerkClient.users.createUser({
    firstName: `Test user ${testId}`,
    password: testId,
    emailAddress: [`${testId}@test.com`],
  })
  const org = await clerkClient.organizations.createOrganization({
    name: `Test org ${testId}`,
    createdBy: user.id,
  })
  const viewer: Viewer = {
    role: 'org',
    orgId: org.id as Id['org'],
  }
  const apiKey = await getOrCreateApikey(viewer)
  return {user, org, viewer, apiKey, testId}
}

export async function tearDownTestOrg(
  testOrg: Awaited<ReturnType<typeof setupTestOrg>>,
) {
  await clerkClient.organizations.deleteOrganization(testOrg.org.id)
  await clerkClient.users.deleteUser(testOrg.user.id)
}
