import {auth} from '@clerk/nextjs/server'
import {type Id, type Viewer} from '@openint/cdk'

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
