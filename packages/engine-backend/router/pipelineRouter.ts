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
        .extend({connectionIds: z.array(zId('conn')).optional()})
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
        destinationId: true,
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
          customerId: zCustomerId.optional(),
          connectionId: zId('conn').optional(),
        })
        .optional(),
    )
    .query(async ({input = {}, ctx}) => {
      // Add info about what it takes to `reconnect` here for connections which
      const connections =
        await ctx.services.metaService.tables.connection.list(input)
      const filteredConnections = input.connectionId
        ? connections.filter((c) => c.id === input.connectionId)
        : connections
      const [integrations, _pipelines] = await Promise.all([
        ctx.services.metaService.tables.integration.list({
          ids: R.compact(filteredConnections.map((c) => c.integrationId)),
        }),
        ctx.services.metaService.findPipelines({
          connectionIds: filteredConnections.map((c) => c.id),
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
          statusMessage: settings?.data?.error?.message,
        }
      }
      function parseConnection(conn?: (typeof connections)[number] | null) {
        if (!conn) {
          return conn
        }
        const connectorName = extractId(conn.id)[1]
        const integrations = intById[conn.integrationId!]
        const mappers = ctx.connectorMap[connectorName]?.standardMappers
        const standardConn = zStandard.connection
          .omit({id: true})
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
          displayName:
            conn.displayName ||
            standardConn?.displayName ||
            standardInt?.name ||
            '',
          integration:
            standardInt && integrations
              ? {...standardInt, id: integrations.id}
              : null,
        }
      }

      return filteredConnections
        .map(parseConnection)
        .filter((r): r is NonNullable<typeof r> => !!r)
        .map((r) => {
          const pipesOut = _pipelines.filter((p) => p.sourceId === r.id)
          const pipesIn = _pipelines.filter((p) => p.destinationId === r.id)
          const pipes = [...pipesOut, ...pipesIn]
          // TODO: Look up based on provider name
          const type: ConnType | null = r.id.startsWith('conn_postgres')
            ? 'destination'
            : 'source'

          // removing settings to avoid leaking secrets
          delete r.settings

          return {
            ...r,
            type,
            pipelineIds: pipes.map((p) => p.id),
            // TODO: Fix me
            lastSyncCompletedAt: pipes.find((p) => p.lastSyncCompletedAt)
              ?.lastSyncCompletedAt,
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
        organizationId: pipeline.source.connectorConfig.orgId,
      })

      const org = z
        .object({webhook_url: z.string().optional()})
        .optional()
        .parse(clerkOrg.privateMetadata)

      return ctx.services._syncPipeline(pipeline, {...opts, org})
    }),
})
