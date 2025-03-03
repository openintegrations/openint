import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {eq, schema} from '@openint/db'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'
import {zListParams} from './index'

export const connectionRouter = router({
  getConnection: publicProcedure
    // TODO: make zId('conn')
    .input(z.object({id: z.string(), force_refresh: z.boolean().optional()}))
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

      const credentialsRequiresRefresh =
        input.force_refresh ||
        connection.settings.oauth?.credentials?.expires_at
          ? new Date(connection.settings.oauth.credentials.expires_at) <
            new Date()
          : false

      if (credentialsRequiresRefresh) {
        // TODO: handle force_refresh
        console.warn(
          'skipping credentialsRequiresRefresh',
          credentialsRequiresRefresh,
        )
      }

      return {
        id: connection.id,
        connector_name: connection.connector_name,
        settings: connection.settings,
        connector_config_id: connection.connector_config_id,
        created_at: connection.created_at,
        updated_at: connection.updated_at,
      }
    }),
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(
      zListParams.extend({
        connector_name: z.string().optional(),
        force_refresh: z.boolean().optional(),
        customer_id: z.string().optional(),
        // TODO: make zId('ccfg').optional()
        // but we get Type 'ZodOptional<ZodEffects<ZodString, `ccfg_${string}${string}`, string>>' is missing the following properties from type 'ZodType<any, any, any>': "~standard", "~validate"
        connector_config_id: z.string().optional(),
      }),
    )
    .output(
      z.object({
        items: z.array(core.connection),
      }),
    )
    .query(async ({ctx, input}) => {
      const connections = await ctx.db.query.connection.findMany({
        with: {
          connector_config_id: input.connector_config_id,
          customer_id: input.customer_id,
          connector_name: input.connector_name,
        },
      })
      const connectionsRequiringRefresh = connections.filter((c) => {
        const credentialsExpired = c.settings.oauth?.credentials?.expires_at
          ? new Date(c.settings.oauth.credentials.expires_at) < new Date()
          : false
        return input.force_refresh || credentialsExpired
      })
      if (connectionsRequiringRefresh.length > 0) {
        // TODO: add refresh logic here
        console.warn(
          'skipping connectionsRequiringRefresh',
          connectionsRequiringRefresh,
        )
      }
      return {items: connections}
    }),
})
