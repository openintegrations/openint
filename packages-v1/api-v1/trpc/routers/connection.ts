import {z} from 'zod'
import {eq, schema} from '@openint/db'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'

export const connectionRouter = router({
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.connection),
      }),
    )
    .query(async ({ctx}) => {
      const connectorConfigs = await ctx.db.query.connection.findMany({
        // TODO: implement me
        where: eq(schema.connection.connector_config_id, ctx.viewer.orgId!),
        with: {
          connector_config: {},
        },
      })
      return {items: connectorConfigs}
    }),
})
