import {auth, createClerkClient, Organization} from '@clerk/nextjs/server'
import {type Id, type Viewer} from '@openint/cdk'
import {env} from '@openint/env'

export {clerkMiddleware} from '@clerk/nextjs/server'

// TODO: Put this into serverSession
// export async function revokeSession() {
//   const authInfo = await auth()
//   if (!authInfo.sessionId) {
//     return
//   }

//   const clerk = getClerkClient()
//   return clerk.sessions.revokeSession(authInfo.sessionId)
// }

export async function viewerFromCookie() {
  const authInfo = await auth()

  const viewer: Viewer = authInfo.userId
    ? {
        role: 'user',
        userId: authInfo.userId as Id['user'],
        orgId: authInfo.orgId as Id['org'],
      }
    : {role: 'anon'}
  return viewer
}

export async function getClerkOrganization(
  orgId: Id['org'],
): Promise<Organization> {
  const client = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  })
  const organization = await client.organizations.getOrganization({
    organizationId: orgId,
  })
  return organization
}
