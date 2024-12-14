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

/** TODO: Should confirm to airbyte record message format, and probably import from it */
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

export const deprecatedInputEntity = z.object({
  id: z.string(),
  entityName: z.string(),
  // TODO: Fix the support here. We hare hacking postgres to be able
  // support both unified +unified inputs and raw only inputs
  // Basically this should work with or without a link... And it's hard to abstract for now
  entity: z.union([
    z.object({
      // For now... in future we shall support arbitrary columns later
      raw: z.unknown(),
      unified: z.unknown(),
    }),
    z.null(),
  ]),
})
export type DeprecatedInputEntity = z.infer<typeof deprecatedInputEntity>

export const postgresSchemas = {
  name: z.literal('postgres'),
  // TODO: Should postgres use integration config or connectionSettings?
  // if it's connectionSettings then it doesn't make as much sense to configure
  // in the list of integrations...
  // How do we create default connections for integrations that are basically single connection?
  connectionSettings: zPgConfig
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
    connection: (_settings) => ({
      displayName: 'Postgres',
      status: 'healthy',
    }),
  },
} satisfies ConnectorDef<typeof postgresSchemas>

export default postgresDef
