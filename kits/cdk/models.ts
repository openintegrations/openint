import {z} from '@opensdks/util-zod'
import {zCustomerId, zId, zUserId} from './id.types'
import {zVerticalKey} from './verticals'

// Utility types

// Types
// Input type (generic, nested)
// - Normlaized, DB type conforms to input type (not generic, possibly generated)
// Output type (parsed, generic, nested)

export type EnvName = z.infer<typeof zEnvName>
export const zEnvName = z.enum(['sandbox', 'development', 'production'])

// MARK: - Standard types

// Should this live inside ZStandard?
/** Will allow users to make these required as needed */
export const zStandardConnectorConfig = z.object({
  env_name: z
    .string()
    .nullish()
    .describe('e.g. sandbox, development, production'),
  pipeline_defaults: z
    .object({
      // TODO: Add representation for configured streams for pipeline also, and of course allow pipelipe
      // to override these settings
      sync_frequency: z
        .enum(['manual', 'hourly', 'daily', 'weekly', 'monthly'])
        .nullish(),
    })
    .nullish()
    .describe('Not implemented yet'),
})

export const zMetadata = z.unknown().describe(`
  JSON object can can be used to associate arbitrary metadata to
  avoid needing a separate 1-1 table just for simple key values in your application.
  During updates this object will be shallowly merged
`)

export type ZStandard = {
  [k in keyof typeof zStandard]: z.infer<(typeof zStandard)[k]>
}
export const zStandard = {
  integration: z.object({
    id: zId('int'),
    name: z.string(),
    // No http prefix preprocessing for logo url as they can be data urls
    logo_url: z
      .string() /*.url()*/
      .optional(),
    login_url: z.preprocess(
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
    display_name: z.string().nullish(),
    /**
     * This correspond to the connection status.
     * Pipeline shall have a separate syncStatus */
    status: z
      .enum([
        'healthy', // Connected and all is well
        'disconnected', // User intervention needed to reconnect
        'error', // System error, nothing user can do. This would also include revoked
        'manual', // This is a manual connection (e.g. import. So normal status does not apply)
      ])
      .nullish(), // Status unknown
    status_message: z.string().nullish(),
    labels: z.array(z.string()).optional(),
  }),
}

// TODO: Make the Input types compatible with our raw types...

// MARK: - Raw types

export type ZRaw = {
  [k in keyof typeof zRaw]: z.infer<(typeof zRaw)[k]>
}
/** Should this be a factory function so we can use typed config / settings? */
// TODO: Consider auto-generating this from database, via a tool such as zapetos, pgtyped
// or prisma, though would need to allow us to override for things like id prefix as well
// as more specific type than just jsonb

const zBase = z.object({
  created_at: z.string(),
  updated_at: z.string(),
})

export const zStreamsV2 = z.record(
  z.object({
    disabled: z.boolean().optional(),
    fields: z.array(z.string()).optional(),
  }),
)
export type StreamsV2 = z.infer<typeof zStreamsV2>

export const zStreamsV1 = z.record(z.boolean())
export type StreamsV1 = z.infer<typeof zStreamsV1>

/** TODO: Add other links / gather the schema from various links here */
export const zLink = z
  .enum([
    'unified_banking',
    'prefix_connector_name',
    'single_table',
    'unified_ats',
    'unified_crm',
    'custom_link_ag',
  ])
  .openapi({ref: 'core.link'})

export const zRaw = {
  connector_config: zBase
    .extend({
      id: zId('ccfg'),
      connector_name: z.string(),
      config: z.record(z.unknown()).nullish(),
      org_id: zId('org'),
      display_name: z.string().nullish(),
      disabled: z.boolean().optional().openapi({
        title: 'Disabled',
        description:
          'When disabled it will not be used for connection portal. Essentially a reversible soft-delete',
      }),

      /** Could be full object later */
      default_pipe_out: z
        .object({
          streams: z.record(z.boolean()).nullish(),
          links: z
            .array(zLink)
            .nullish()
            .describe(
              'Array of transformations that the data gets piped through on the way out. Typically used for things like unification / normalization.',
            ),
          destination_id: zId('conn').optional().openapi({
            description: 'Defaults to the org-wide postgres',
          }),
        })
        .nullish()
        .describe(
          'Automatically sync data from any connections associated with this config to the destination connection, which is typically a Postgres database. Think ETL',
        ),
      default_pipe_in: z
        .object({
          links: z
            .array(zLink)
            .nullish()
            .describe(
              'Array of transformations that the data gets piped through on the way out. Typically used for things like unification / normalization.',
            ),
          source_id: zId('conn'),
        })
        .nullish()
        .describe(
          'Automatically sync data from any connections associated with this config to the destination connection, which is typically a Postgres database. Think ETL',
        ),
      /** This is a generated column, which is not the most flexible. Maybe we need some kind of mapStandardIntegration method? */
      env_name: z.string().nullish(),
      metadata: zMetadata,
    })
    .openapi({ref: 'core.connector_config'}),
  connection: zBase
    .extend({
      id: zId('conn'),
      connector_name: z.string().describe('Unique name of the connector'),
      display_name: z.string().nullish(),
      customer_id: zCustomerId.nullish(),
      connector_config_id: zId('ccfg'),
      integration_id: zId('int').nullish(),
      settings: z.record(z.unknown()).nullish(),
      standard: zStandard.connection.omit({id: true}).nullish(),
      disabled: z.boolean().optional(),
      metadata: zMetadata,
    })
    .openapi({ref: 'core.connection'}),
  pipeline: zBase
    .extend({
      id: zId('pipe'),
      // TODO: Remove nullish now that pipelines are more fixed
      source_id: zId('conn').optional(),
      source_state: z.record(z.unknown()).optional(),
      source_vertical: z.string().optional().nullable(),
      streams: zStreamsV2.nullish(),
      destination_id: zId('conn').optional(),
      destination_state: z.record(z.unknown()).optional(),
      destination_vertical: z.string().optional().nullable(),
      link_options: z
        .array(z.unknown())
        // z.union([
        //   z.string(),
        //   z.tuple([z.string()]),
        //   z.tuple([z.string(), z.unknown()]),
        // ]),
        .nullish(),
      // TODO: Add two separate tables sync_jobs to keep track of this instead of these two
      // though questionnable whether it should be in a separate database completely
      // just like Airbyte. Or perhaps using airbyte itself as the jobs database
      last_sync_started_at: z.string().nullish(),
      last_sync_completed_at: z.string().nullish(),
      disabled: z.boolean().optional(),
      metadata: zMetadata,
    })
    .openapi({ref: 'core.pipeline'}),
  integration: zBase
    .extend({
      id: zId('int'),
      connector_name: z.string(),
      standard: zStandard.integration.omit({id: true}).nullish(),
      external: z.record(z.unknown()).nullish(),
    })
    .openapi({ref: 'core.integration'}),
  // TODO: Add connection_attempts
  // TODO: Figure out how to add this later
  event: z
    .object({
      // ev_{external_id} i.e. from inngest, clerk, stripe, etc
      id: zId('evt'),
      name: z.string(),
      data: z.record(z.unknown()).nullish(),
      timestamp: z.string(),
      user: z.record(z.unknown()).nullish(),
      org_id: zId('org').nullish(),
      customer_id: zCustomerId.nullish(),
      user_id: zUserId.nullish(),
    })
    .openapi({ref: 'core.event'}),
  // customer: zBase
  //   .extend({
  //     id: zCustomerId,
  //     org_id: zId('org'),
  //     metadata: z.unknown(),
  //   })
  //   .openapi({ref: 'core.customer'}),
}
