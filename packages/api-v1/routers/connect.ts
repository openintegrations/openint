import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import type {ConnectorServer, ExtCustomerId} from '@openint/cdk'
import {zConnectOptions, zId, zPostConnectOptions} from '@openint/cdk'
import {eq, schema} from '@openint/db'
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
    .query(async ({ctx, input}) => {
      const connectors = serverConnectors as Record<string, ConnectorServer>
      const connector = connectors[input.data.connector_name]
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector ${input.data.connector_name} not found`,
        })
      }
      const ccfg = await ctx.db.query.connector_config.findFirst({
        where: eq(schema.connector_config.id, input.id),
      })
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${input.id} not found`,
        })
      }

      console.log('preConnect', input, ctx, ccfg)
      const res = await connector.preConnect?.(
        ccfg.config,
        {
          webhookBaseUrl:
            'https://webhook.site/ce79fc9e-8f86-45f2-8701-749b770e5cdb',
          extCustomerId: (ctx.viewer.role === 'customer'
            ? ctx.viewer.customerId
            : ctx.viewer.userId) as ExtCustomerId,
        },
        input.data.input,
      )
      return {
        connector_name: input.data.connector_name,
        output: res,
      }
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
