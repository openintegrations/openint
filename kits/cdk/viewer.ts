import {z} from '@opensdks/util-zod'
import {TRPCError} from '@trpc/server'
import * as jwt from 'jsonwebtoken'
import type {DiscriminatedUnionWithAllKeys} from '@openint/util'
import {R, zFunction} from '@openint/util'
import type {CustomerId, ExtCustomerId, Id, UserId} from './id.types'
import {zCustomerId, zId, zUserId} from './id.types'

export const zRole = z.enum(['anon', 'customer', 'user', 'org', 'system'])
export {ExtCustomerId}

export const zViewer = z
  .discriminatedUnion('role', [
    z.object({role: z.literal(zRole.Enum.anon)}),
    // prettier-ignore
    z.object({role: z.literal(zRole.Enum.customer), customer_id: zCustomerId, org_id: zId('org')}),
    z.object({
      role: z.literal(zRole.Enum.user),
      user_id: zUserId,
      org_id: zId('org').nullish(),
      extra: z.record(z.unknown()).optional().describe('Currently clerk user'),
    }),
    z.object({
      role: z.literal(zRole.Enum.org),
      org_id: zId('org'),
      extra: z
        .record(z.unknown())
        .optional()
        .describe('Currently clerk organization'),
    }),
    z.object({role: z.literal(zRole.Enum.system)}),
  ])
  .openapi({ref: 'Viewer'})

export type ViewerRole = z.infer<typeof zRole>

type _Viewer = DiscriminatedUnionWithAllKeys<z.infer<typeof zViewer>>
export type Viewer<R extends ViewerRole = ViewerRole> = Extract<
  _Viewer,
  {role: R}
>

export function hasRole<R extends ViewerRole>(
  viewer: Viewer,
  roles: R[],
): viewer is Viewer<R> {
  return roles.includes(viewer.role as R)
}

// MARK: -

/** Used to easily tell if two viewers are identical */
export function getViewerId(viewer: Viewer) {
  switch (viewer.role) {
    case 'anon':
      return 'anon'
    case 'customer':
      return `${viewer.org_id}/cus_${viewer.customer_id}`
    case 'user':
      // orgId is actually optional, thus userId first
      return R.compact([viewer.user_id, viewer.org_id]).join('/')
    case 'org':
      return viewer.org_id
    case 'system':
      return 'system'
  }
}

/** Used for external systems */
export function getExtCustomerId(
  viewer: Viewer<'customer' | 'user' | 'org' | 'system'>,
) {
  switch (viewer.role) {
    case 'customer':
      return `cus_${viewer.customer_id}` as ExtCustomerId
    case 'user':
      // Falling back to userId should not generally happen
      return (viewer.org_id ?? viewer.user_id) as ExtCustomerId
    case 'org':
      return viewer.org_id as ExtCustomerId
    case 'system':
      return 'system' as ExtCustomerId
  }
}

// MARK: - JWT

/**
 * Clerk template for jwt payload below
{
	"aud": "authenticated",
	"role": "authenticated",
	"email": "{{user.primary_email_address}}",
	"org_id": "{{org.id}}",
	"org_name": "{{org.name}}",
	"org_role": "{{org.role}}",
	"org_slug": "{{org.slug}}",
	"app_metadata": {},
	"user_metadata": {}
}
 */
export const zJwtPayload = z.object({
  /** Different meaning in different contexts */
  sub: z.string(),
  /**
   * Jwt role is different from viewer role because supabase uses `authenticated`
   * by default and it's a bit too much work right now to switch to `user` so we shall
   * accept both then
   */
  role: z.enum([...zRole.options, 'authenticated']),
  /** Enforce that all jwts are timed. The actual validity check is done by jwtClient */
  exp: z.number(),
  org_id: zId('org').nullish(),
  /** Clerk: `admin` for sure and probably `basic_member` */
  org_role: z.string().nullish(),
  /** For readable urls, unique across org */
  org_slug: z.string().nullish(),
})

export const zViewerFromJwtPayload = zJwtPayload
  .nullish()
  .transform((payload): Viewer => {
    // console.log('zViewerFromJwtPayload', payload)
    switch (payload?.role) {
      case undefined:
      case 'anon':
        return {role: 'anon'}
      case 'user':
      case 'authenticated':
        return {
          role: 'user',
          user_id: payload.sub as UserId,
          org_id: payload.org_id,
        }
      // good reason to rename customer to customer
      case 'customer': {
        const [orgId, customerId] = payload.sub.split('/') as [
          Id['org'],
          CustomerId,
        ]
        return {role: payload.role, customer_id: customerId, org_id: orgId}
      }
      case 'org':
        return {role: payload.role, org_id: payload.sub as Id['org']}
      case 'system':
        return {role: 'system'}
    }
  })
  .pipe(zViewer)

export const zViewerFromUnverifiedJwtToken = z
  .string()
  .nullish()
  .transform((token) => (token ? jwt.decode(token, {json: true}) : token))
  .pipe(zViewerFromJwtPayload)

// MARK: - JWT Client, maybe doesn't actually belong in here? Among
// other things would allow us to not have to import @trpc/server on the frontend

export function jwtDecode(token: string) {
  return jwt.decode(token, {json: true})
}

export const makeJwtClient = zFunction(
  z.object({secretOrPublicKey: z.string()}),
  ({secretOrPublicKey}) => ({
    verifyViewer: (token?: string | null): Viewer => {
      if (!token) {
        return {role: 'anon'}
      }
      try {
        const data = jwt.verify(token, secretOrPublicKey)
        if (typeof data === 'string') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'JWT payload must be an object, not a string.',
          })
        }
        // console.log('jwt.verify', data)
        return zViewerFromJwtPayload.parse(data)
      } catch (err) {
        // console.log('jwt.verify Error', err)
        // Actually throw token expired errror
        throw new TRPCError({code: 'UNAUTHORIZED', message: `${err}`})
        // if (!`${err}`.includes('TokenExpiredError')) {
        //   // This dependency is not great... But don't know of a better pattern for now
        // }
        // return {role: 'anon'}
      }
    },
    signViewer: (
      viewer: Viewer,
      {validityInSeconds = 3600}: {validityInSeconds?: number} = {},
    ) => {
      const payload = {
        role: 'anon',
        exp: Math.floor(Date.now() / 1000) + validityInSeconds,
        ...(viewer.role === 'customer' && {
          role: 'customer',
          sub: `${viewer.org_id}/${viewer.customer_id}`,
          customer_id: viewer.customer_id, // Needed for RLS
          org_id: viewer.org_id, // Needed for RLS
        }),
        ...(viewer.role === 'org' && {
          role: 'org',
          sub: viewer.org_id,
          org_id: viewer.org_id, // Needed for RLS
        }),
        ...(viewer.role === 'user' && {
          role: 'authenticated',
          sub: viewer.user_id,
          org_id: viewer.org_id, // Needed for RLS
        }),
        ...(viewer.role === 'system' && {
          role: 'system',
          sub: 'system',
        }),
        // Partial is a lie, it should not happen
      } satisfies Partial<z.input<typeof zViewerFromJwtPayload>>

      return jwt.sign(payload, secretOrPublicKey)
    },
  }),
)

export type JWTClient = ReturnType<typeof makeJwtClient>
