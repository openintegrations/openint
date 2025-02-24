import {z} from 'zod'
import {eq, schema} from '@openint/db-v1'
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
      const connectorConfigs = await ctx.db.query.connector_config.findMany({
        where: eq(schema.connector_config.org_id, ctx.viewer.orgId!),
      })
      return {items: connectorConfigs}
    }),
})
