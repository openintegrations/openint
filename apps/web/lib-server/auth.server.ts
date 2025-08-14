import type {zJwtPayload} from '@openint/api-v1/lib/makeJwtClient'
import type {MaybePromise, NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import type {PageProps} from '@/lib-common/next-utils'

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
  const viewer = await viewerFromCookie().catch((err: unknown): Viewer => {
    // prettier-ignore
    if (String(err).includes("auth() was called but Clerk can't detect usage of clerkMiddleware")) {
      return {role: 'anon'}
    }
    throw err
  })

  // how do we get the token as well without signing again?
  // TODO: we need a way to ensure api calling token does not expire while user is still logged in
  // and that's why we don't want to sign separate token but rather
  // reuse the token they have existing...
  const token = await jwt.signToken(viewer)

  return {viewer, token, payload: undefined}
}

export async function currentViewerFromPageProps(props: PageProps) {
  console.log('🔍 currentViewerFromPageProps: parsing props...')
  const {
    searchParams: {token},
  } = await parsePageProps(props, {
    searchParams: z.object({token: z.string().optional()}),
  })

  console.log(
    '🎫 Token from searchParams:',
    token ? `present (${token.substring(0, 20)}...)` : 'missing',
  )

  const {viewer, payload} = await jwt.verifyToken(token)
  console.log('✅ Token verified successfully:', viewer.role, viewer.orgId)
  return {viewer, token, payload} satisfies ServerSession
}

export async function currentViewer(props?: PageProps) {
  console.log(
    '🔍 currentViewer called with props:',
    !!props,
    props ? 'has props' : 'no props',
  )

  const {viewer, token, payload} = await firstNonAnonViewerOrFirst([
    props
      ? (async (): Promise<ServerSession> => {
          console.log('🎫 Attempting currentViewerFromPageProps...')
          try {
            const result = await currentViewerFromPageProps(props)
            console.log(
              '✅ currentViewerFromPageProps success:',
              result.viewer.role,
              result.viewer.orgId,
            )
            return result
          } catch (error) {
            console.log('❌ currentViewerFromPageProps failed:', String(error))
            throw error
          }
        })()
      : (async (): Promise<ServerSession> => {
          console.log('🚫 Skipping pageProps auth (no props provided)')
          return Promise.resolve({
            viewer: {role: 'anon' as const},
            token: '',
            payload: undefined,
          })
        })(),
    (async (): Promise<ServerSession> => {
      console.log('🍪 Attempting currentViewerFromCookie...')
      try {
        const result = await currentViewerFromCookie()
        console.log(
          '✅ currentViewerFromCookie success:',
          result.viewer.role,
          result.viewer.orgId,
        )
        return result
      } catch (error) {
        console.log('❌ currentViewerFromCookie failed:', String(error))
        throw error
      }
    })(),
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
  console.log(
    '🔄 firstNonAnonViewerOrFirst: resolving',
    _viewers.length,
    'auth methods...',
  )
  const viewers = await Promise.all(_viewers)

  console.log('📊 Authentication results:')
  viewers.forEach((viewer, index) => {
    console.log(
      `  [${index}] role: ${viewer.viewer.role}, orgId: ${viewer.viewer.orgId}, hasToken: ${!!viewer.token}`,
    )
  })

  const selected = viewers.find((v) => v.viewer.role !== 'anon') ?? viewers[0]
  console.log(
    '🎯 Selected viewer:',
    selected.viewer.role,
    selected.viewer.orgId,
    'hasToken:',
    !!selected.token,
  )

  // TODO: Refactor this with resolveViewer. bit we need the token though...
  return selected
}
