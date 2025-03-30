import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util'
import type {zUser} from './splitwise-schema'
import {zCurrentUser} from './splitwise-schema'

export const splitwiseSchemas = {
  name: z.literal('splitwise'),
  connectionSettings: z.object({
    currentUser: zCurrentUser.nullish(),
    accessToken: z.string(),
  }),
} satisfies ConnectorSchemas

export const splitwiseHelpers = connHelpers(splitwiseSchemas)

export const splitwiseDef = {
  name: 'splitwise',
  schemas: splitwiseSchemas,
  metadata: {
    verticals: ['personal-finance'],
    logoUrl: '/_assets/logo-splitwise.svg',
  },
} satisfies ConnectorDef<typeof splitwiseSchemas>

// Helpers
export function formatUser(user?: z.infer<typeof zUser>) {
  return user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : 'Unnamed user'
}

export default splitwiseDef
