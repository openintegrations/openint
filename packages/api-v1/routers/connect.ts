import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import type {ConnectorServer, ExtCustomerId} from '@openint/cdk'
import {makeId, zConnectOptions, zId, zPostConnectOptions} from '@openint/cdk'
import {dbUpsertOne, eq, schema} from '@openint/db'
import {makeUlid} from '@openint/util'
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

      if (!ctx.viewer.orgId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'OrgId is required',
        })
      }

      console.log('preConnect input', input)
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
      console.log('preConnect output', res)
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
      z.object({
        id: zId('ccfg').describe(md`
          Must correspond to data.connector_name.
          Technically id should imply connector_name already but there is no way to
          specify a discriminated union with id alone.
        `),
        options: zPostConnectOptions,
        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        data: z
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
      }),
    )
    .output(core.connection)
    .mutation(async ({ctx, input}) => {
      console.log('postConnect', input, ctx)
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
      const connUpdate = await connector.postConnect?.(
        input.data.input,
        ccfg.config,
        {
          webhookBaseUrl:
            'https://webhook.site/ce79fc9e-8f86-45f2-8701-749b770e5cdb',
          extCustomerId: (ctx.viewer.role === 'customer'
            ? ctx.viewer.customerId
            : ctx.viewer.userId) as ExtCustomerId,
        },
      )
      const id = makeId('conn', input.data.connector_name, makeUlid())
      const [conn] = await dbUpsertOne(
        ctx.db,
        schema.connection,
        {
          id,
          settings: connUpdate?.settings,
          connector_config_id: input.id,
          customer_id: ctx.viewer.customerId ?? ctx.viewer.userId,
          // add integration id
        },
        {keyColumns: ['id']},
      ).returning()

      return {
        ...conn!,
        // NOTE: its not clear to me why it doesn't take the dbUpsertOne customer_id
        // it's failing with: Types of property 'customer_id' are incompatible.
        // Type 'string | null' is not assignable to type 'string'.
        //Type 'null' is not assignable to type 'string'.
        // same as connection.ts
        customer_id: ctx.viewer.customerId ?? ctx.viewer.userId ?? '',
      }
    }),
})
