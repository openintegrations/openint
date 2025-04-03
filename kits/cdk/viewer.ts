import {TRPCError} from '@trpc/server'
import * as jose from 'jose'
import {compact} from '@openint/util/array-utils'
import type {DiscriminatedUnionWithAllKeys} from '@openint/util/type-utils'
import {zFunction} from '@openint/util/zod-function-utils'
import {z, type Z} from '@openint/util/zod-utils'
import type {CustomerId, ExtCustomerId, Id, UserId} from './id.types'
import {zCustomerId, zId, zUserId} from './id.types'

export const zRole = z.enum(['anon', 'customer', 'user', 'org', 'system'])
export {ExtCustomerId}

export const zViewer = z
  .discriminatedUnion('role', [
    z.object({role: z.literal(zRole.Enum.anon)}),
    // prettier-ignore
    z.object({role: z.literal(zRole.Enum.customer), customerId: zCustomerId, orgId: zId('org')}),
    z.object({
      role: z.literal(zRole.Enum.user),
      userId: zUserId,
      orgId: zId('org').nullish(),
      extra: z.record(z.unknown()).optional().describe('Currently clerk user'),
    }),
    z.object({
      role: z.literal(zRole.Enum.org),
      orgId: zId('org'),
      extra: z
        .record(z.unknown())
        .optional()
        .describe('Currently clerk organization'),
    }),
    z.object({role: z.literal(zRole.Enum.system)}),
  ])
  .openapi({ref: 'Viewer'})

export type ViewerRole = Z.infer<typeof zRole>

type _Viewer = DiscriminatedUnionWithAllKeys<Z.infer<typeof zViewer>>
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
      return `${viewer.orgId}/cus_${viewer.customerId}`
    case 'user':
      // orgId is actually optional, thus userId first
      return compact([viewer.userId, viewer.orgId]).join('/')
    case 'org':
      return viewer.orgId
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
      return `cus_${viewer.customerId}` as ExtCustomerId
    case 'user':
      // Falling back to userId should not generally happen
      return (viewer.orgId ?? viewer.userId) as ExtCustomerId
    case 'org':
      return viewer.orgId as ExtCustomerId
    case 'system':
      return 'system' as ExtCustomerId
  }
}

/**
 * Potentially temporary function to elevate the role to org if the viewer is a customer
 * to allow access to org data
 * TODO: Consider improving RLS policy to not need this
 */
export function asOrgIfCustomer(viewer: Viewer): Viewer {
  if (viewer.role === 'customer') {
    return {role: 'org', orgId: viewer.orgId}
  }
  return viewer
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
  sub: z.string().nullish(),
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
          userId: payload.sub as UserId,
          orgId: payload.org_id,
        }
      // good reason to rename customer to customer
      case 'customer': {
        const [orgId, customerId] = (payload.sub?.split('/') ?? []) as [
          Id['org'],
          CustomerId,
        ]
        return {role: payload.role, customerId, orgId}
      }
      case 'org':
        return {role: payload.role, orgId: payload.sub as Id['org']}
      case 'system':
        return {role: 'system'}
    }
  })
  .pipe(zViewer)

export const zViewerFromUnverifiedJwtToken = z
  .string()
  .nullish()
  .transform((token) => (token ? jose.decodeJwt(token) : token))
  .pipe(zViewerFromJwtPayload)

// MARK: - JWT Client, maybe doesn't actually belong in here? Among
// other things would allow us to not have to import @trpc/server on the frontend

export const makeJwtClient = zFunction(
  z.object({secretOrPublicKey: z.string()}),
  ({secretOrPublicKey}) => ({
    verifyViewer: async (token?: string | null): Promise<Viewer> => {
      if (!token) {
        return {role: 'anon'}
      }
      try {
        const result = await jose.jwtVerify(
          token,
          new TextEncoder().encode(secretOrPublicKey),
        )
        // console.log('jwt.verify', data)
        return zViewerFromJwtPayload.parse(result.payload)
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
    signViewer: async (
      viewer: Viewer,
      {validityInSeconds = 3600}: {validityInSeconds?: number} = {},
    ) => {
      const payload = {
        role: 'anon',
        exp: Math.floor(Date.now() / 1000) + validityInSeconds,
        ...(viewer.role === 'customer' && {
          role: 'customer',
          sub: `${viewer.orgId}/${viewer.customerId}`,
          customer_id: viewer.customerId, // Needed for RLS
          org_id: viewer.orgId, // Needed for RLS
        }),
        ...(viewer.role === 'org' && {
          role: 'org',
          sub: viewer.orgId,
          org_id: viewer.orgId, // Needed for RLS
        }),
        ...(viewer.role === 'user' && {
          role: 'authenticated',
          sub: viewer.userId,
          org_id: viewer.orgId, // Needed for RLS
        }),
        ...(viewer.role === 'system' && {
          role: 'system',
          sub: 'system',
        }),
        // Partial is a lie, it should not happen
      } satisfies Partial<Z.input<typeof zViewerFromJwtPayload>>
      return new jose.SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(Date.now() / 1000 + validityInSeconds)
        .sign(new TextEncoder().encode(secretOrPublicKey))
    },
  }),
)

export type JWTClient = ReturnType<typeof makeJwtClient>
