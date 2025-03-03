import {z} from 'zod'
import {publicProcedure, router} from '../_base'

export const connectionRouter = router({
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(z.void())
    .output(
      z.object({
        // items: z.array(core.connection),
        items: z.array(
          z.object({
            id: z.string(),
            connector_config_id: z.string().nullable(),
          }),
        ),
      }),
    )
    .query(async ({ctx}) => {
      const connections = await ctx.db.query.connection.findMany({
        with: {connector_config: {}},
      })
      return {items: connections}
    }),
})
