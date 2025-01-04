import {clerkClient} from '@clerk/nextjs/server'
import type {Id, Viewer} from '@openint/cdk'
import {getOrCreateApikey} from '../lib-server/procedures'

export async function resetClerk() {
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
  const now = new Date().toISOString()
  const user = await clerkClient.users.createUser({
    firstName: `Test user ${now}`,
    password: now,
    emailAddress: [`${now.replaceAll(':', '_')}@test.com`],
  })
  const org = await clerkClient.organizations.createOrganization({
    name: `Test org ${now}`,
    createdBy: user.id,
  })
  const viewer: Viewer = {
    role: 'org',
    orgId: org.id as Id['org'],
  }
  const apiKey = await getOrCreateApikey(viewer)
  return {user, org, viewer, apiKey}
}
