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
  // New format for event name. Having `/` is not supported in event names due to slash having
  // very specific meaning in openapi spec.
  'sync.completed': {
    pipeline_id: zId('pipe'),
    source_id: zId('conn'),
    destination_id: zId('conn'),
  },
  // Backend events
  'debug.debug': {},
  'sync.scheduler-debug': {},
  'sync.pipeline-requested': {pipelineId: zId('pipe')},
  'sync.connection-requested': {connectionId: zId('conn')},
  'connect.connection-connected': {connectionId: zId('conn')},
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
  'db.connection-created': {connectionId: zId('conn')},
  'db.connection-deleted': {connectionId: zId('conn')},
  'user.signin': {},
  'user.signout': {},
  'connect.session-started': {connectorName: z.string(), meta: z.unknown()},
  'connect.session-cancelled': {connectorName: z.string(), meta: z.unknown()},
  'connect.session-succeeded': {connectorName: z.string(), meta: z.unknown()},
  'connect.session-errored': {connectorName: z.string(), meta: z.unknown()},
  'api.token-copied': {},
  'api.graphql-request': {},
  'api.rest-request': {},
  pageview: {
    current_url: z.string(),
    path: z.string(),
  },
} satisfies Record<string, Z.ZodRawShape>
