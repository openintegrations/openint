import type {
  ConnectorDef,
  ConnectorSchemas,
  EntityPayloadWithRaw,
} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util'

export const zPgConfig = z.object({
  databaseUrl: z.string(),
  migrationsPath: z.string().optional(),
  migrationTableName: z.string().optional(),
  transformFieldNames: z.boolean().optional(),
  migrateTables: z.boolean().optional(),
})

/** TODO: Should confirm to airbyte record message format */
export const zRecordMessageBody = z.object({
  /** should be optional in case of insert not upsert */
  id: z.string(),
  /** aka `stream` */
  entityName: z.string(),
  /**
   * aka `data`
   * Should we support non-record data?
   * Typically contains {unified, raw} fields
   */
  entity: z.record(z.unknown()),
  namespace: z.string().optional(),
  upsert: z
    .object({
      insert_only_columns: z.array(z.string()).optional(),
      key_columns: z.array(z.string()).optional(),
      must_match_columns: z.array(z.string()).optional(),
      no_diff_columns: z.array(z.string()).optional(),
      shallow_merge_jsonb_columns: z.array(z.string()).optional(),
    })
    .optional(),
})
export type RecordMessageBody = z.infer<typeof zRecordMessageBody>

export const postgresSchemas = {
  name: z.literal('postgres'),
  // TODO: Should postgres use integration config or resourceSettings?
  // if it's resourceSettings then it doesn't make as much sense to configure
  // in the list of integrations...
  // How do we create default resources for integrations that are basically single resource?
  resourceSettings: zPgConfig
    .pick({databaseUrl: true, migrateTables: true})
    .extend({
      // gotta make sourceQueries a Textarea

      sourceQueries: z
        .object({
          invoice: z
            .string()
            .nullish()
            .describe('Should order by lastModifiedAt and id descending'),
        })
        // .nullish() does not translate well to jsonSchema
        // @see https://share.cleanshot.com/w0KVx1Y2
        .optional(),
    }),
  destinationInputEntity: zRecordMessageBody,
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

export const postgresHelpers = connHelpers(postgresSchemas)

export const postgresDef = {
  name: 'postgres',
  metadata: {
    verticals: ['database'],
    logoUrl: '/_assets/logo-postgres.svg',
    stage: 'ga',
  },

  schemas: postgresSchemas,
  standardMappers: {
    resource: (_settings) => ({
      displayName: 'Postgres',
      status: 'healthy',
    }),
  },
} satisfies ConnectorDef<typeof postgresSchemas>

export default postgresDef
