import type {Z} from '@openint/util/zod-utils'

import {zId} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

// TODO: Implement webhook as events too

export const zUserTraits = z
  .object({
    /** Also sets the display name in posthog ui */
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    orgId: z.string(),
  })
  .partial()

export type UserTraits = Z.infer<typeof zUserTraits>

export const zOrgProperties = z
  .object({
    webhook_url: z.string(),
  })
  .partial()

export type OrgProperties = Z.infer<typeof zOrgProperties>

// TODO: Can we learn from trpc to make all the events here easy to refactor across the codebase?
export const eventMap = {
  // Backend events
  'debug.debug': {},
  'webhook.received': {
    /** For debugging requests */
    traceId: z.string(),
    method: z.string(),
    path: z.string(),
    query: z.record(z.unknown()),
    headers: z.record(z.unknown()),
    body: z.unknown(),
  },
  // Analytics events
  'db.user-created': {},
  'db.user-deleted': {},
  'db.connection-created': {connection_id: zId('conn')},
  'db.connection-deleted': {connection_id: zId('conn')},
  'user.signin': {},
  'user.signout': {},
  'connect.session-started': {connector_name: z.string(), meta: z.unknown()},
  'connect.session-cancelled': {connector_name: z.string(), meta: z.unknown()},
  'connect.session-succeeded': {connector_name: z.string(), meta: z.unknown()},
  'connect.session-errored': {connector_name: z.string(), meta: z.unknown()},
  'connect.connection-connected': {connection_id: zId('conn')},
  'api.token-copied': {},
  'api.graphql-request': {},
  'api.rest-request': {},
  pageview: {
    current_url: z.string(),
    path: z.string(),
  },

  /** @deprecated */
  'sync.completed': {
    source_id: z.string(),
    customer_id: z.string(),
    pipeline_id: z.string(),
    destination_id: z.string(),
  },
  /** @deprecated */
  'sync.pipeline-requested': {},
  /** @deprecated */
  'sync.connection-requested': {},
} satisfies Record<string, Z.ZodRawShape>
