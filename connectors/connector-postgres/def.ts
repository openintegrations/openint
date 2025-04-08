import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zPgConfig = z.object({
  databaseURL: z.string(),
})

export const postgresSchemas = {
  name: z.literal('postgres'),
  // TODO: Should postgres use integration config or connectionSettings?
  // if it's connectionSettings then it doesn't make as much sense to configure
  // in the list of integrations...
  // How do we create default connections for integrations that are basically single connection?
  connection_settings: zPgConfig.pick({databaseURL: true}).extend({
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
