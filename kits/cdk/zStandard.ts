import type {Z} from '@openint/util/zod-utils'

import {z} from '@openint/util/zod-utils'
import {zId} from './id.types'
import {zVerticalKey} from './verticals'

// Utility types

// Types
// Input type (generic, nested)
// - Normlaized, DB type conforms to input type (not generic, possibly generated)
// Output type (parsed, generic, nested)

export type ZStandard = {
  [k in keyof typeof zStandard]: Z.infer<(typeof zStandard)[k]>
}
export const zStandard = {
  integration: z.object({
    id: zId('int'),
    name: z.string(),
    // No http prefix preprocessing for logo url as they can be data urls
    logoUrl: z.string().url().optional(),
    loginUrl: z.preprocess(
      // Sometimes url get returned without http prefix...
      // Is there a way to "catch" invalid url error then retry with prefix?
      // Would be better than just prefixing semi-blindly.
      (url) =>
        typeof url === 'string' && !url.toLowerCase().startsWith('http')
          ? `https://${url}`
          : url,
      z.string().url().optional(),
    ),
    /** TODO: Is this the same as connector vertical? */
    verticals: z.array(zVerticalKey).nullish(),
  }),
  connection: z.object({
    id: zId('conn'),
    displayName: z.string().nullish(),
    /**
     * This correspond to the connection status.
     * Pipeline shall have a separate syncStatus */
    status: z
      .enum([
        'healthy', // Connected and all is well
        'disconnected', // User intervention needed to reconnect. this includes revoked
        'error', // System error, nothing user can do, should recover on its own
        'manual', // This is a manual connection (e.g. import. So normal status does not apply)
        'unknown', // Status unknown, this is the default if status is missing
      ])
      .nullish(), // Status unknown
    statusMessage: z.string().nullish(),
    labels: z.array(z.string()).optional(),
  }),
}
