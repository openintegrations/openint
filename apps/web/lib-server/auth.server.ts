import type {PageProps} from '@/lib-common/next-utils'
import type {zJwtPayload} from '@openint/api-v1/lib/makeJwtClient'
import type {MaybePromise, NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import {type Viewer} from '@openint/cdk'
import {viewerFromCookie} from '@openint/console-auth/server'
import {dbUpsertOne, eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import {db, jwt} from './globals'

export type ServerSession = {
  viewer: Viewer
  token: string | undefined
  payload: Z.infer<typeof zJwtPayload> | undefined
}

export async function currentViewerFromCookie() {
  const viewer = await viewerFromCookie()
  // how do we get the token as well without signing again?
  // TODO: we need a way to ensure api calling token does not expire while user is still logged in
  // and that's why we don't want to sign separate token but rather
  // reuse the token they have existing...
  const token = await jwt.signToken(viewer)

  return {viewer, token, payload: undefined}
}

export async function currentViewerFromPageProps(props: PageProps) {
  const {
    searchParams: {token},
  } = await parsePageProps(props, {
    searchParams: z.object({token: z.string().optional()}),
  })

  const {viewer, payload} = await jwt.verifyToken(token)
  return {viewer, token, payload} satisfies ServerSession
}

export async function currentViewer(props?: PageProps) {
  const {viewer, token, payload} = await firstNonAnonViewerOrFirst([
    props
      ? currentViewerFromPageProps(props)
      : Promise.resolve({
          viewer: {role: 'anon'},
          token: '',
          payload: undefined,
        }),
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
  return {viewer, token, payload} satisfies ServerSession
}

async function firstNonAnonViewerOrFirst(
  _viewers: NonEmptyArray<MaybePromise<ServerSession>>,
): Promise<ServerSession> {
  const viewers = await Promise.all(_viewers)
  // TODO: Refactor this with resolveViewer. bit we need the token though...
  return viewers.find((v) => v.viewer.role !== 'anon') ?? viewers[0]
}
