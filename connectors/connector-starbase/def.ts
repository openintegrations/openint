import type {
  ConnectorDef,
  ConnectorSchemas,
  EntityPayloadWithRaw,
} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util'
import {deprecatedInputEntity} from '../connector-postgres'

export const zPgConfig = z.object({
  credentials: z.union([
    z.null().openapi({title: 'Use Credentials in Customer Metadata'}),
    z
      .object({
        starbaseDbHost: z.string(),
        starbaseDbToken: z.string(),
      })
      .openapi({title: 'Use my own StarbaseDb Instance'}),
  ]),
  migrateTables: z.boolean().optional(),
})

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
  connectionSettings: zPgConfig,
  // same as postgres
  destinationInputEntity: z.union([zRecordMessageBody, deprecatedInputEntity]),
  sourceOutputEntity: zCast<EntityPayloadWithRaw>(),
  sourceState: z
    .object({
      invoice: z
        .object({
          lastModifiedAt: z.string().optional(),
          lastRowId: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
} satisfies ConnectorSchemas

export const postgresHelpers = connHelpers(starbaseSchemas)

export const postgresDef = {
  name: 'starbase',
  metadata: {
    verticals: ['database'],
    logoUrl: '/_assets/logo-starbase.svg',
    stage: 'alpha',
  },

  schemas: starbaseSchemas,
  standardMappers: {
    connection: (_settings) => ({
      displayName: 'Starbase',
      status: 'healthy',
    }),
  },
} satisfies ConnectorDef<typeof starbaseSchemas>

export default postgresDef
