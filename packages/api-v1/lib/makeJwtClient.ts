import type {CustomerId, Id, UserId} from '@openint/cdk/id.types'
import type {Viewer} from '@openint/cdk/viewer'
import type {Z} from '@openint/util/zod-utils'

import {TRPCError} from '@trpc/server'
import * as jose from 'jose'
import {zId} from '@openint/cdk/id.types'
import {zViewer, zViewerRole} from '@openint/cdk/viewer'
import {zFunction} from '@openint/util/zod-function-utils'
import {z} from '@openint/util/zod-utils'
import {zConnectOptions} from '../models'

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
  /** Options for the connect embed */
  connect_options: zConnectOptions.optional(),
})

export function viewerFromJwtPayload(
  payload: Z.infer<typeof zJwtPayload>,
): Viewer {
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

// MARK: - JWT Client, maybe doesn't actually belong in here? Among
// other things would allow us to not have to import @trpc/server on the frontend

export const makeJwtClient = zFunction(
  z.object({secretOrPublicKey: z.string()}),
  ({secretOrPublicKey}) => ({
    verifyToken: async (
      token?: string | null,
    ): Promise<{
      viewer: Viewer
      payload: Z.infer<typeof zJwtPayload> | undefined
    }> => {
      if (!token) {
        return {viewer: {role: 'anon'}, payload: undefined}
      }
      try {
        const result = await jose.jwtVerify(
          token,
          new TextEncoder().encode(secretOrPublicKey),
        )
        const payload = zJwtPayload.parse(result.payload)
        const viewer = zViewer.parse(viewerFromJwtPayload(payload))
        return {viewer, payload}

        // console.log('jwt.verify', data)
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
    signToken: async (
      viewer: Viewer,
      {
        validityInSeconds = 3600,
        connectOptions,
      }: {
        validityInSeconds?: number
        connectOptions?: Z.infer<typeof zConnectOptions>
      } = {},
    ) => {
      const payload = {
        role: 'anon',
        exp: Math.floor(Date.now() / 1000) + validityInSeconds,
        ...(viewer.role === 'customer' && {
          role: 'customer',
          sub: `${viewer.orgId}/${viewer.customerId}`,
          customer_id: viewer.customerId, // Needed for RLS
          org_id: viewer.orgId, // Needed for RLS
          ...(connectOptions && {connect_options: connectOptions}),
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
      } satisfies Partial<Z.infer<typeof zJwtPayload>>
      return new jose.SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime(Date.now() / 1000 + validityInSeconds)
        .sign(new TextEncoder().encode(secretOrPublicKey))
    },
  }),
)
export type JWTClient = ReturnType<typeof makeJwtClient>

export function asCustomerOfOrg(
  viewer: Viewer,
  input: {customerId: CustomerId},
): Viewer<'customer'> {
  if (!('orgId' in viewer) || !viewer.orgId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Current viewer missing orgId to create token',
    })
  }
  if (
    viewer.role === 'customer' &&
    input.customerId &&
    input.customerId !== viewer.customerId
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Current viewer cannot create token for other customer',
    })
  }
  const customerId =
    viewer.role === 'customer' ? viewer.customerId : input.customerId
  if (!customerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Either call as an customer or pass customerId explicitly',
    })
  }

  return {role: 'customer', customerId, orgId: viewer.orgId}
}
