import {z} from 'zod'
import {and, count, eq, schema} from '@openint/db'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models'
import {
  expandConnector,
  zConnectorName,
  zExpandOptions,
} from '../utils/connectorUtils'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from '../utils/pagination'

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector-config',
        description:
          'List all connector configurations with optional filtering',
        summary: 'List Connector Configurations',
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
})
