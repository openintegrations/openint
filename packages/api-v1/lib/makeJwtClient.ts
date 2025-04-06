import {TRPCError} from '@trpc/server'
import * as jose from 'jose'
import {zId, type CustomerId, type Id, type UserId} from '@openint/cdk/id.types'
import type {Viewer} from '@openint/cdk/viewer'
import {zViewer, zViewerRole} from '@openint/cdk/viewer'
import {zFunction} from '@openint/util/zod-function-utils'
import type {Z} from '@openint/util/zod-utils'
import {z} from '@openint/util/zod-utils'

export const zJwtPayload = z.object({
  /** Different meaning in different contexts */
  sub: z.string().nullish(),
  /**
   * Jwt role is different from viewer role because supabase uses `authenticated`
   * by default and it's a bit too much work right now to switch to `user` so we shall
   * accept both then
   */
  role: z.enum([...zViewerRole.options, 'authenticated']),
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
