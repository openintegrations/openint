import type {ZRaw, ZStandard} from '@openint/cdk'
import {
  extractId,
  oauthBaseSchema,
  zCustomerId,
  zId,
  zRaw,
  zStandard,
} from '@openint/cdk'
import {R, z} from '@openint/util'
import {inngest} from '../inngest'
import {zSyncOptions} from '../types'
import {protectedProcedure, trpc} from './_base'
import {zListParams} from './_schemas'

export {type inferProcedureInput} from '@openint/trpc'

const tags = ['Core']

export const pipelineRouter = trpc.router({
  listPipelines: protectedProcedure
    .meta({openapi: {method: 'GET', path: '/core/pipeline', tags}})
    .input(
      zListParams
        .extend({connection_ids: z.array(zId('conn')).optional()})
        .optional(),
    )
    .output(z.array(zRaw.pipeline))
    .query(async ({input = {}, ctx}) => {
      const pipelines = await ctx.services.metaService.findPipelines(input)
      return pipelines as Array<ZRaw['pipeline']>
    }),
  updatePipeline: protectedProcedure
    .meta({openapi: {method: 'PATCH', path: '/core/pipeline/{id}', tags}})
    .input(
      zRaw.pipeline.pick({
        id: true,
        metadata: true,
        disabled: true,
        streams: true,
      }),
    )
    .output(zRaw.pipeline)
    .mutation(async ({ctx, input: {id, ...input}}) =>
      ctx.services.patchReturning('pipeline', id, input),
    ),
  createPipeline: protectedProcedure
    .meta({openapi: {method: 'POST', path: '/core/pipeline', tags}})
    .input(
      zRaw.pipeline.pick({
        id: true,
        metadata: true,
        disabled: true,
        sourceId: true,
        streams: true,
        destination_id: true,
      }),
    )
    .output(zRaw.pipeline)
    .mutation(async ({ctx, input: {id, ...input}}) =>
      ctx.services.patchReturning('pipeline', id, input),
    ),
  deletePipeline: protectedProcedure
    .meta({openapi: {method: 'DELETE', path: '/core/pipeline/{id}', tags}})
    .input(z.object({id: zId('pipe')}))
    .output(z.literal(true))
    .mutation(async ({ctx, input}) => {
      await ctx.services.metaService.tables.pipeline.delete(input.id)
      return true as const
    }),
  listConnections: protectedProcedure
    .input(
      zListParams
        .extend({
          customer_id: zCustomerId.optional(),
          connection_id: zId('conn').optional(),
        })
        .optional(),
    )
    .query(async ({input = {}, ctx}) => {
      // Add info about what it takes to `reconnect` here for connections which
      const connections =
        await ctx.services.metaService.tables.connection.list(input)
      const filteredConnections = input.connection_id
        ? connections.filter((c) => c.id === input.connection_id)
        : connections
      const [integrations, _pipelines] = await Promise.all([
        ctx.services.metaService.tables.integration.list({
          ids: R.compact(filteredConnections.map((c) => c.integration_id)),
        }),
        ctx.services.metaService.findPipelines({
          connection_ids: filteredConnections.map((c) => c.id),
        }),
        // We used to check connection health here, but we're moving it to async in future
        // ...connections.map((c) => performConnectionCheck(ctx, c.id, {})),
      ])
      type ConnType = 'source' | 'destination'

      const intById = R.mapToObj(integrations, (ins) => [ins.id, ins])

      function defaultConnectionMapper(
        conn: ZRaw['connection'],
      ): Omit<ZStandard['connection'], 'id'> {
        const settings = oauthBaseSchema.connectionSettings.safeParse(
          conn.settings,
        )

        if (!settings.success) {
          // no op
          return {
            ...conn,
            status: 'healthy',
          }
        }

        return {
          ...conn,
          status: settings?.data?.error?.code
            ? //  TODO: extend to more states, i.e. code === 'refresh_token_external_error' should be reconnected
              'disconnected'
            : 'healthy', // default
          status_message: settings?.data?.error?.message,
        }
      }
      function parseConnection(conn?: (typeof connections)[number] | null) {
        if (!conn) {
          return conn
        }
        const connectorName = extractId(conn.id)[1]
        const integrations = intById[conn.integration_id!]
        const mappers = ctx.connectorMap[connectorName]?.standardMappers
        const standardConn = zStandard.connection
          .omit({id: true, settings: true})
          .nullish()
          .parse(
            mappers?.connection?.(conn.settings) ||
              defaultConnectionMapper(conn),
          )
        const standardInt =
          // QQ: what are the implications for external data integrations UI rendering of using this either or ?? and also returning the id?
          integrations?.standard ??
          zStandard.integration
            .omit({id: true})
            .nullish()
            .parse(
              integrations && mappers?.integration?.(integrations?.external),
            )

        return {
          ...conn,
          ...standardConn,
          id: conn.id,
          display_name:
            conn.display_name ||
            standardConn?.display_name ||
            standardInt?.name ||
            '',
          integration:
            standardInt && integrations
              ? {...standardInt, id: integrations.id}
              : null,
        }
      }
      const pipelines = _pipelines.map((pipe) => ({
        ...pipe,
        sync_in_progress:
          (pipe.last_sync_started_at && !pipe.last_sync_completed_at) ||
          (pipe.last_sync_started_at &&
            pipe.last_sync_completed_at &&
            pipe.last_sync_started_at > pipe.last_sync_completed_at),
      }))
      return filteredConnections
        .map(parseConnection)
        .filter((r): r is NonNullable<typeof r> => !!r)
        .map((r) => {
          const pipesOut = pipelines.filter((p) => p.source_id === r.id)
          const pipesIn = pipelines.filter((p) => p.destination_id === r.id)
          const pipes = [...pipesOut, ...pipesIn]
          // TODO: Look up based on provider name
          const type: ConnType | null = r.id.startsWith('conn_postgres')
            ? 'destination'
            : 'source'

          // removing settings to avoid leaking secrets
          delete r.settings

          return {
            ...r,
            sync_in_progress: pipes.some((p) => p.sync_in_progress),
            type,
            pipeline_ids: pipes.map((p) => p.id),
            // TODO: Fix me
            last_sync_completed_at: pipes.find((p) => p.last_sync_completed_at)
              ?.last_sync_completed_at,
          }
        })
    }),
  syncPipeline: protectedProcedure
    .meta({openapi: {method: 'POST', path: '/core/pipeline/{id}/_sync', tags}})
    .input(z.object({id: zId('pipe')}).merge(zSyncOptions))
    .output(z.object({}))
    .mutation(async function syncPipeline({input: {id: pipeId, ...opts}, ctx}) {
      if (ctx.viewer.role === 'customer') {
        await ctx.services.getPipelineOrFail(pipeId) // Authorization
      }
      if (opts?.async) {
        await inngest.send({
          name: 'sync/pipeline-requested',
          data: {pipelineId: pipeId},
        })
        return
      }
      const pipeline = await ctx.asOrgIfNeeded.getPipelineExpandedOrFail(pipeId)
      console.log('[syncPipeline]', pipeline)
      const clerkOrg = await ctx.clerk.organizations.getOrganization({
        organizationId: pipeline.source.connector_config.org_id,
      })

      const org = z
        .object({webhook_url: z.string().optional()})
        .optional()
        .parse(clerkOrg.privateMetadata)

      return ctx.services._syncPipeline(pipeline, {...opts, org})
    }),
})
