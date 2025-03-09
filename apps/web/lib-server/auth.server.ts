import {auth, createClerkClient} from '@clerk/nextjs/server'
import type {Id, Viewer} from '@openint/cdk'
import {env} from '@openint/env'
import type {MaybePromise, NonEmptyArray} from '@openint/util'
import {z} from '@openint/util'
import type {PageProps} from '@/lib-common/next-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {jwt} from './globals'

export const getClerkClient = () =>
  createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  })

// TODO: Put this into serverSession
// export async function revokeSession() {
//   const authInfo = await auth()
//   if (!authInfo.sessionId) {
//     return
//   }

//   const clerk = getClerkClient()
//   return clerk.sessions.revokeSession(authInfo.sessionId)
// }

export type ServerSession = {viewer: Viewer; token: string | undefined}

export async function currentViewerFromCookie() {
  const authInfo = await auth()

  const viewer: Viewer = authInfo.userId
    ? {
        role: 'user',
        userId: authInfo.userId as Id['user'],
        orgId: authInfo.orgId as Id['org'],
      }
    : {role: 'anon'}
  // how do we get the token as well without signing again?
  // TODO: we need a way to ensure api calling token does not expire while user is still logged in
  // and that's why we don't want to sign separate token but rather
  // reuse the token they have existing...
  const token = await jwt.signViewer(viewer)

  return {viewer, token}
}

export async function currentViewerFromPageProps(props: PageProps) {
  const {
    searchParams: {token},
  } = await parsePageProps(props, {
    searchParams: z.object({token: z.string().optional()}),
  })

  const viewer = await jwt.verifyViewer(token)
  return {viewer, token}
}

export async function currentViewer(props?: PageProps) {
  return firstNonAnonViewerOrFirst([
    props
      ? currentViewerFromPageProps(props)
      : Promise.resolve({viewer: {role: 'anon'}, token: ''}),
    currentViewerFromCookie(),
  ])
}

async function firstNonAnonViewerOrFirst(
  _viewers: NonEmptyArray<MaybePromise<ServerSession>>,
): Promise<ServerSession> {
  const viewers = await Promise.all(_viewers)
  return viewers.find((v) => v.viewer.role !== 'anon') ?? viewers[0]
}
