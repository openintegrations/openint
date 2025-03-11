import {z} from 'zod'
import {zConnectOptions, zId, zPostConnectOptions} from '@openint/cdk'
import {core, parseNonEmpty} from '../models'
import {connectorSchemas} from '../models/connectorSchemas'
import {customerProcedure, router} from '../trpc/_base'
import {md} from './utils/md'

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
        id: zId('ccfg').describe(md`
          Must correspond to data.connector_name.
          Technically id should imply connector_name already but there is no way to
          specify a discriminated union with id alone.
        `),
        options: zConnectOptions,

        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        // this is a limitation of trpc-to-OpenAPI. Need to think more about this
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
  postConnect: customerProcedure
    .meta({
      openapi: {
        enabled: false, // tuple type not supported by openAPI
        method: 'POST',
        path: '/connect/post-connect',
      },
    })
    .input(
      z.tuple([
        zId('ccfg'),
        zPostConnectOptions,
        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        z
          .discriminatedUnion(
            'connector_name',
            parseNonEmpty(
              connectorSchemas.connectOutput.map((s) =>
                z
                  .object({
                    connector_name: s.shape.connector_name,
                    input: s.shape.connectOutput,
                  })
                  .openapi({
                    ref: `connectors.${s.shape.connector_name.value}.connectOutput`,
                  }),
              ),
            ),
          )
          .describe('Connector specific data'),
      ]),
    )
    .output(core.connection)
    .mutation(async ({ctx, input}) => {
      console.log('postConnect', input, ctx)
      throw new Error('Not implemented')
    }),
})
