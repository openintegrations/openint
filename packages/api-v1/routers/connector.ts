import type {Z} from '@openint/util/zod-utils'

import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z} from '@openint/util/zod-utils'
import {core} from '../models'
import {publicProcedure, router} from '../trpc/_base'
import {getConnectorModel, zConnectorName} from './connector.models'
import {zListResponse} from './utils/pagination'

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
    .input(z.object({expand: z.array(zExpandOption).optional()}).optional())
    .output(zListResponse(zConnectorExtended).describe('List of connectors'))
    .query(async ({input}) => {
      const items = Object.values(defConnectors).map((def) =>
        getConnectorModel(def, {
          includeSchemas: input?.expand?.includes('schemas'),
        }),
      )
      return {
        items,
        total: items.length,
        limit: 0,
        offset: 0,
      }
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
        expand: z.array(zExpandOption).optional(),
      }),
    )
    .output(zConnectorExtended)
    .query(async ({input}) => {
      return getConnectorModel(defConnectors[input.name], {
        includeSchemas: input.expand?.includes('schemas'),
      })
    }),
})
