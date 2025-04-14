import type {ConnectorServer} from '@openint/cdk'

import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {z} from '@openint/util/zod-utils'
import {TRPCError} from '@trpc/server'
import {publicProcedure, router} from '../trpc/_base'
import {zConnectorName} from './connector.models'

export const webhookRouter = router({
  handleWebhook: publicProcedure
    .meta({
      openapi: {
        enabled: true, // need the openapi to be enabled to use the passthrough
        method: 'POST',
        path: '/webhook/{connector_name}',
        description: 'Handle a webhook event',
      },
    })
    .input(z.object({connector_name: zConnectorName}).passthrough())
    .output(z.object({status: z.enum(['ok', 'error']), info: z.unknown()}))
    .mutation(async ({input}) => {
      console.log('handleWebhook', input)
      const serverConnector = serverConnectors[
        input.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer
      if (!serverConnector.handleWebhook) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `Connector ${input.connector_name} does not support webhooks`,
        })
      }
      // Not handled yet
      return {status: 'error', info: input}
    }),
})
