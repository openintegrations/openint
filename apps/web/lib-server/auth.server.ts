import {auth} from '@clerk/nextjs/server'
import {type Id, type Viewer} from '@openint/cdk'
import {dbUpsertOne, eq, schema} from '@openint/db'
import type {MaybePromise} from '@openint/util/type-utils'
import type {NonEmptyArray} from '@openint/util/type-utils'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import type {PageProps} from '@/lib-common/next-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {db, jwt} from './globals'

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
  const {viewer, token} = await firstNonAnonViewerOrFirst([
    props
      ? currentViewerFromPageProps(props)
      : Promise.resolve({viewer: {role: 'anon'}, token: ''}),
    currentViewerFromCookie(),
  ])
  // Ensure the org exists in the database if not already
  // TODO: How do we add a test for this?
  if (viewer.orgId) {
    const org = await db.query.organization.findFirst({
      where: eq(schema.organization.id, viewer.orgId),
    })
    if (!org) {
      console.log('Org not found, lazily creating...', viewer.orgId)
      await dbUpsertOne(
        db,
        schema.organization,
        {
          id: viewer.orgId,
          api_key: `key_${makeUlid()}`,
        },
        {insertOnlyColumns: ['api_key']},
      )
    }
  }
  return {viewer, token}
}

async function firstNonAnonViewerOrFirst(
  _viewers: NonEmptyArray<MaybePromise<ServerSession>>,
): Promise<ServerSession> {
  const viewers = await Promise.all(_viewers)
  return viewers.find((v) => v.viewer.role !== 'anon') ?? viewers[0]
}
