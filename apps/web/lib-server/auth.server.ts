import type {PageProps} from '@/lib-common/next-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {type Viewer} from '@openint/cdk'
import {viewerFromCookie} from '@openint/console-auth/server'
import {dbUpsertOne, eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import type {MaybePromise, NonEmptyArray} from '@openint/util/type-utils'
import {z} from '@openint/util/zod-utils'
import {db, jwt} from './globals'

export type ServerSession = {viewer: Viewer; token: string | undefined}

export async function currentViewerFromCookie() {
  const viewer = await viewerFromCookie()
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
  // TODO: Refactor this with resolveViewer. bit we need the token though...
  return viewers.find((v) => v.viewer.role !== 'anon') ?? viewers[0]
}
