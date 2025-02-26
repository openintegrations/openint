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
      return `${viewer.orgId}/cus_${viewer.customerId}`
    case 'user':
      // orgId is actually optional, thus userId first
      return R.compact([viewer.userId, viewer.orgId]).join('/')
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
  /** Issued at time */
  iat: z.number(),
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
        const [orgId, customerId] = payload.sub.split('/') as [
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
  .transform((token) => (token ? jwt.decode(token, {json: true}) : token))
  .pipe(zViewerFromJwtPayload)

// MARK: - JWT Client, maybe doesn't actually belong in here? Among
// other things would allow us to not have to import @trpc/server on the frontend

export function jwtDecode(token: string) {
  return jwt.decode(token, {json: true})
}

export const makeJwtClient = zFunction(
  z.object({
    secretOrPrivateKey: z.string(),
    publicKey: z.string().optional(),
  }),
  ({secretOrPrivateKey, publicKey}) => {
    // Determine if we're using asymmetric keys (RS256) or symmetric secret (HS256)
    const isAsymmetric =
      !!publicKey &&
      (() => {
        try {
          JSON.parse(secretOrPrivateKey)
          JSON.parse(publicKey)
          return true
        } catch {
          return false
        }
      })()

    return {
      verifyViewer: async (token?: string | null): Promise<Viewer> => {
        if (!token) {
          return {role: 'anon'}
        }

        try {
          let payload

          if (isAsymmetric) {
            // Dynamically import jose
            const {jwtVerify} = await import('jose')
            // RS256 with jose
            const {payload: verifiedPayload} = await jwtVerify(
              token,
              JSON.parse(publicKey),
              {algorithms: ['RS256']},
            )
            payload = verifiedPayload
          } else {
            // HS256 with jsonwebtoken
            const data = jwt.verify(token, secretOrPrivateKey)
            if (typeof data === 'string') {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'JWT payload must be an object, not a string.',
              })
            }
            payload = data
          }

          return zViewerFromJwtPayload.parse(payload)
        } catch (err) {
          throw new TRPCError({code: 'UNAUTHORIZED', message: `${err}`})
        }
      },

      signViewer: async (
        viewer: Viewer,
        {
          validityInSeconds = 3600,
          keyId,
        }: {validityInSeconds?: number; keyId?: string} = {},
      ) => {
        const exp = Math.floor(Date.now() / 1000) + validityInSeconds
        const iat = Math.floor(Date.now() / 1000)

        let sub = ''
        let role: ViewerRole | 'authenticated' = 'anon'
        let extraClaims: Record<string, any> = {}

        switch (viewer.role) {
          case 'customer':
            role = 'customer'
            sub = `${viewer.orgId}/${viewer.customerId}`
            extraClaims = {
              customer_id: viewer.customerId,
              org_id: viewer.orgId,
            }
            break
          case 'org':
            role = 'org'
            sub = viewer.orgId
            extraClaims = {
              org_id: viewer.orgId,
            }
            break
          case 'user':
            role = 'authenticated'
            sub = viewer.userId
            extraClaims = {
              org_id: viewer.orgId,
            }
            break
          case 'system':
            role = 'system'
            sub = 'system'
            break
          // anon case is handled by default values
        }

        if (isAsymmetric) {
          // Dynamically import jose
          const {SignJWT} = await import('jose')
          // RS256 with jose
          const jwtToken = new SignJWT({
            role,
            exp,
            ...extraClaims,
          })
            .setProtectedHeader({alg: 'RS256', ...(keyId ? {kid: keyId} : {})})
            .setSubject(sub)
            .setExpirationTime(exp)
            .setIssuedAt(iat)
            .sign(JSON.parse(secretOrPrivateKey))

          return jwtToken
        } else {
          // HS256 with jsonwebtoken
          const payload = {
            role: role as
              | 'anon'
              | 'customer'
              | 'user'
              | 'org'
              | 'system'
              | 'authenticated',
            sub,
            exp,
            iat,
            ...extraClaims,
          } satisfies Partial<z.input<typeof zViewerFromJwtPayload>>

          return jwt.sign(payload, secretOrPrivateKey)
        }
      },
    }
  },
)

export type JWTClient = ReturnType<typeof makeJwtClient>
