import {z} from 'zod'
import {zConnectOptions, zId} from '@openint/cdk'
import {parseNonEmpty} from '../models'
import {connectorSchemas} from '../models/connectorSchemas'
import {customerProcedure, router} from '../trpc/_base'

export const connectRouter = router({
  preConnect: customerProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/pre-connect',
      },
    })
    .input(
      z.object({
        id: zId('ccfg'),
        options: zConnectOptions,

        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        data: z
          .discriminatedUnion(
            'connector_name',
            parseNonEmpty(
              connectorSchemas.preConnectInput.map((s) =>
                z
                  .object({
                    connector_name: s.shape.connector_name,
                    input: s.shape.preConnectInput,
                  })
                  .openapi({
                    ref: `connectors.${s.shape.connector_name.value}.preConnectInput`,
                  }),
              ),
            ),
          )
          .describe('Connector specific data'),
      }),
    )
    .output(
      z
        .discriminatedUnion(
          'connector_name',
          parseNonEmpty(
            connectorSchemas.connectInput.map((s) =>
              z
                .object({
                  connector_name: s.shape.connector_name,
                  output: s.shape.connectInput,
                })
                .openapi({
                  ref: `connectors.${s.shape.connector_name.value}.connectInput`,
                }),
            ),
          ),
        )
        .describe('Connector specific data'),
    )
    .mutation(async ({ctx, input}) => {
      console.log('preConnect', input, ctx)
      throw new Error('Not implemented')
    }),
})
