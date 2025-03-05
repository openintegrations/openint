import {z} from 'zod'
import {makeId} from '@openint/cdk'
import {schema} from '@openint/db'
import {makeUlid} from '@openint/util'
import {authenticatedProcedure, orgProcedure, router} from '../_base'

// import {core} from '../../models'

/** TODO: Use the real type */
const connector_config = z.object({
  id: z.string(),
  org_id: z.string(),
  connector_name: z.string(),
})

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {method: 'GET', path: '/connector-config'},
    })
    .input(z.void())
    .output(z.object({items: z.array(connector_config)}))
    .query(async ({ctx}) => {
      const connectorConfigs = await ctx.db.query.connector_config.findMany({})
      return {items: connectorConfigs}
    }),
  createConnectorConfig: orgProcedure
    .meta({
      openapi: {method: 'POST', path: '/connector-config'},
    })
    .input(
      z.object({
        connector_name: z.string(),
      }),
    )
    .output(connector_config)
    .mutation(async ({ctx, input}) => {
      const {connector_name} = input
      const [ccfg] = await ctx.db
        .insert(schema.connector_config)
        .values({
          org_id: ctx.viewer.orgId,
          id: makeId('ccfg', connector_name, makeUlid()),
        })
        .returning()
      return ccfg!
    }),
})
