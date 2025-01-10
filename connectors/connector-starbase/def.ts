import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util'
import {deprecatedInputEntity} from '../connector-postgres'

export const zRecordMessageBody = z.object({
  stream: z.string(),
  /** Should we support non-record data? Typically contains {unified, raw} fields */
  data: z.record(z.unknown()),
  namespace: z.string().optional(),
  upsert: z
    .object({
      insert_only_columns: z.array(z.string()).optional(),
      key_columns: z.array(z.string()).optional(),
      must_match_columns: z.array(z.string()).optional(),
      no_diff_columns: z.array(z.string()).optional(),
      shallow_merge_jsonb_columns: z.union([
        z.array(z.string()).optional(),
        z.boolean(),
      ]),
    })
    .optional(),
})
export type RecordMessageBody = z.infer<typeof zRecordMessageBody>

export const starbaseSchemas = {
  name: z.literal('starbase'),
  connectorConfig: z.object({
    credentials: z.union([
      z.null().openapi({title: 'Use Credentials in Customer Metadata'}),
      z
        .object({
          starbaseDbHost: z.string(),
          starbaseDbToken: z.string(),
        })
        .openapi({title: 'Use my own StarbaseDB Instance'}),
    ]),
    migrateTables: z.boolean().optional(),
  }),
  // same as postgres
  destinationInputEntity: z.union([zRecordMessageBody, deprecatedInputEntity]),
} satisfies ConnectorSchemas

export const starbaseHelpers = connHelpers(starbaseSchemas)

export const starbaseDef = {
  name: 'starbase',
  metadata: {
    verticals: ['database'],
    logoUrl: '/_assets/logo-starbase.svg',
    stage: 'beta',
  },

  schemas: starbaseSchemas,
  standardMappers: {
    connection: (_settings) => ({
      displayName: 'Starbase',
      status: 'healthy',
    }),
  },
} satisfies ConnectorDef<typeof starbaseSchemas>

export default starbaseDef
