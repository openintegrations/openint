import {TRPCError} from '@trpc/server'
import {compact} from '@openint/util/array-utils'
import type {DiscriminatedUnionWithAllKeys} from '@openint/util/type-utils'
import {z, type Z} from '@openint/util/zod-utils'
import type {CustomerId, ExtCustomerId} from './id.types'
import {zCustomerId, zId, zUserId} from './id.types'

export const zViewerRole = z.enum(['anon', 'customer', 'user', 'org', 'system'])
export {ExtCustomerId}

export const zViewer = z
  .discriminatedUnion('role', [
    z.object({role: z.literal(zViewerRole.Enum.anon)}),
    // prettier-ignore
    z.object({role: z.literal(zViewerRole.Enum.customer), customerId: zCustomerId, orgId: zId('org')}),
    z.object({
      role: z.literal(zViewerRole.Enum.user),
      userId: zUserId,
      orgId: zId('org').nullish(),
      extra: z.record(z.unknown()).optional().describe('Currently clerk user'),
    }),
    z.object({
      role: z.literal(zViewerRole.Enum.org),
      orgId: zId('org'),
      extra: z
        .record(z.unknown())
        .optional()
        .describe('Currently clerk organization'),
    }),
    z.object({role: z.literal(zViewerRole.Enum.system)}),
  ])
  .openapi({ref: 'Viewer'})

export type ViewerRole = Z.infer<typeof zViewerRole>

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

/**
 * Used when there are multiple authentication methods, resolve to the first
 * non-anon viewer or anon if none are found
 */
export function resolveViewer(
  viewers: Array<Viewer | null | undefined>,
): Viewer {
  return viewers.find((v) => v?.role !== 'anon') ?? {role: 'anon'}
}
