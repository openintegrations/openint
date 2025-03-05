import {z} from 'zod'
import {makeId} from '@openint/cdk'
import {and, count, eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util'
import {authenticatedProcedure, orgProcedure, router} from '../_base'
import {core} from '../../models'
import {expandConnector, zExpandOptions} from '../utils/connectorUtils'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from '../utils/pagination'
import {zConnectorName} from './connection'

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector-config',
        description:
          'List all connector configurations with optional filtering',
      },
    })
    .input(
      zListParams
        .extend({
          expand: z.array(zExpandOptions).optional().default([]),
          connector_name: zConnectorName.optional(),
        })
        .optional(),
    )
    .output(zListResponse(core.connector_config))
    .query(async ({ctx, input}) => {
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            connector_config: schema.connector_config,
            total: count(),
          })
          .from(schema.connector_config)
          .where(
            and(
              input?.connector_name
                ? eq(
                    schema.connector_config.connector_name,
                    input.connector_name,
                  )
                : undefined,
            ),
          ),
        schema.connector_config.created_at,
        input,
      )

      const {items, total} = await processPaginatedResponse(
        query,
        'connector_config',
      )

      return {
        items: await Promise.all(
          items.map(async (ccfg) =>
            input?.expand.includes('connector')
              ? {...ccfg, connector: await expandConnector(ccfg)}
              : ccfg,
          ),
        ),
        total,
        limit,
        offset,
      }
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
    .output(core.connector_config)
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
