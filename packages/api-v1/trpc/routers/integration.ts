import type {ConnectorDef, ConnectorServer} from '@openint/cdk'

import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/cnext/connectors.server'
import {z} from '@openint/util/zod-utils'
import {publicProcedure, router} from '../_base'
import {getConnectorModel, zConnectorName} from './connector.models'

export const integrationRouter = router({
  listConnectorIntegrations: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector/{name}/integrations',
        description: 'List all integrations for a connector',
        summary: 'List Connector Integrations',
      },
    })
    .input(z.object({name: zConnectorName}))
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            logo_url: z.string().nullish(),
          }),
        ),
        next_cursor: z.string().nullish(),
      }),
    )
    .query(async ({input}) => {
      const def = defConnectors[input.name] as ConnectorDef
      const model = getConnectorModel(def)
      const connector = serverConnectors[
        input.name as keyof typeof serverConnectors
      ] as unknown as ConnectorServer | undefined

      if (!connector?.listIntegrations) {
        return {
          items: [
            {
              id: `int_${input.name}`,
              name: model.display_name ?? model.name,
              logo_url: model.logo_url,
            },
          ],
          next_cursor: null,
        }
      }
      const res = await connector.listIntegrations({})
      return {
        items: res.items.map((item) => ({
          id: item.id,
          name: item.name,
          logo_url: item.logo_url,
        })),
        next_cursor: res.next_cursor,
      }
    }),
})
