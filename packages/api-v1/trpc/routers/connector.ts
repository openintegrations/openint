import type {Z} from '@openint/util/zod-utils'

import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z, zCoerceArray} from '@openint/util/zod-utils'
import {publicProcedure, router} from '../_base'
import {core} from '../../models/core'
import {getConnectorModel, zConnectorName} from './connector.models'
import {zListParams, zListResponse} from './utils/pagination'

export const zConnectorExtended = core.connector.extend({
  integrations: z.array(core.integration_select).optional(),
})

export type ConnectorExtended = Z.infer<typeof zConnectorExtended>

export const zExpandOption = z.enum(['schemas'])

export const connectorRouter = router({
  listConnectors: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector',
        description:
          'List all connectors to understand what integrations are available to configure',
        summary: 'List Connectors',
      },
    })
    .input(
      zListParams
        .extend({expand: zCoerceArray(zExpandOption).optional()})
        .default({}),
    )
    .output(zListResponse(zConnectorExtended).describe('List of connectors'))
    .query(async ({input: {limit, offset, expand}}) => {
      const connectors = Object.values(defConnectors).map((def) =>
        getConnectorModel(def, {
          includeSchemas: expand?.includes('schemas'),
        }),
      )
      const items = connectors.slice(offset, offset + limit)
      const total = items.length
      const has_next_page = offset + limit >= items.length

      return {items, total, limit, offset, has_next_page}
    }),
  getConnectorByName: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector/{name}',
        description: 'Get a connector by name',
        enabled: false,
      },
    })
    .input(
      z.object({
        name: zConnectorName,
        expand: zCoerceArray(zExpandOption).optional(),
      }),
    )
    .output(zConnectorExtended)
    .query(async ({input}) => {
      return getConnectorModel(defConnectors[input.name], {
        includeSchemas: input.expand?.includes('schemas'),
      })
    }),
})
