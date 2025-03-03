import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {count, eq, schema, SQL} from '@openint/db'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'
import {zListParams, zListResponse} from './index'

// TODO: don't make any
function formatConnection(connection: any, include_secrets: boolean = false) {
  const connector =
    defConnectors[connection.connector_name as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection.id}`,
    })
  }

  const logoUrl =
    connector.metadata &&
    'logoUrl' in connector.metadata &&
    connector.metadata.logoUrl?.startsWith('http')
      ? connector.metadata.logoUrl
      : connector.metadata && 'logoUrl' in connector.metadata
        ? // TODO: replace this with our own custom domain
          `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/${connector.metadata.logoUrl}`
        : undefined

  return {
    ...connection,
    logo_url: logoUrl,
    ...(include_secrets ? {settings: connection.settings} : {}),
  }
}

export const connectionRouter = router({
  getConnection: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection/{id}'},
    })
    // TODO: make zId('conn')
    .input(z.object({id: z.string(), include_secrets: z.boolean().optional()}))
    .output(core.connection)
    .query(async ({ctx, input}) => {
      const connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!connection || !connection.connector_config_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      return formatConnection(connection, input.include_secrets ?? false)
    }),
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(
      zListParams.extend({
        connector_name: z.string().optional(),
        customer_id: z.string().optional(),
        // TODO: make zId('ccfg').optional()
        // but we get Type 'ZodOptional<ZodEffects<ZodString, `ccfg_${string}${string}`, string>>' is missing the following properties from type 'ZodType<any, any, any>': "~standard", "~validate"
        connector_config_id: z.string().optional(),
        include_secrets: z.boolean().optional(),
      }),
    )
    .output(zListResponse(core.connection))
    .query(async ({ctx, input}) => {
      const limit = input.limit ?? 50
      const offset = input.offset ?? 0

      const whereConditions: SQL<unknown>[] = []

      if (input.connector_config_id) {
        whereConditions.push(
          eq(schema.connection.connector_config_id, input.connector_config_id),
        )
      }
      if (input.customer_id) {
        whereConditions.push(
          eq(schema.connection.customer_id, input.customer_id),
        )
      }
      if (input.connector_name) {
        whereConditions.push(
          eq(schema.connection.connector_name, input.connector_name),
        )
      }

      const whereClause =
        whereConditions.length > 0
          ? whereConditions.reduce(
              (acc, condition) => {
                if (acc === true) return condition
                return acc && condition
              },
              true as boolean | SQL<unknown>,
            )
          : undefined

      // Use a single query with COUNT(*) OVER() to get both results and total count
      const result = await ctx.db
        .select({
          connection: schema.connection,
          total: count(),
        })
        .from(schema.connection)
        .where(whereClause as SQL<unknown>)
        .limit(limit)
        .offset(offset)

      const connections = result.map((r) => r.connection)
      const total = result.length > 0 ? Number(result[0]?.total ?? 0) : 0

      return {
        items: connections.map((conn) =>
          formatConnection(conn, input.include_secrets ?? false),
        ),
        total,
        limit,
        offset,
      }
    }),
  checkConnection: publicProcedure
    .meta({
      openapi: {method: 'POST', path: '/connection/{id}/check'},
    })
    .input(
      z.object({
        id: z.string(),
        force_refresh: z.boolean().optional(),
        include_secrets: z.boolean().optional(),
      }),
    )
    .output(core.connection)
    .mutation(async ({ctx, input}) => {
      const connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!connection || !connection.connector_config_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      const credentialsRequiresRefresh =
        input.force_refresh ||
        connection.settings.oauth?.credentials?.expires_at
          ? new Date(connection.settings.oauth.credentials.expires_at) <
            new Date()
          : false

      if (credentialsRequiresRefresh) {
        // TODO: implement refresh logic here
        console.warn('Connection requires refresh', credentialsRequiresRefresh)
        // Add actual refresh implementation
      }

      return formatConnection(connection, input.include_secrets ?? false)
    }),
})
