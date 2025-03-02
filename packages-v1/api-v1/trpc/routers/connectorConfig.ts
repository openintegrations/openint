import {z} from 'zod'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models'

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {method: 'GET', path: '/connector-config'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.connector_config),
      }),
    )
    .query(async ({ctx}) => {
      const connectorConfigs = await ctx.db.query.connector_config.findMany({})
      return {items: connectorConfigs}
    }),
})
