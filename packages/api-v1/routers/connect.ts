import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {discriminatedUnionBySchemaKey} from '@openint/all-connectors/schemas'
import type {ConnectorDef, ConnectorServer, ExtCustomerId} from '@openint/cdk'
import {
  asCustomerOfOrg,
  makeId,
  makeJwtClient,
  zConnectOptions,
  zId,
  zPostConnectOptions,
} from '@openint/cdk'
import {dbUpsertOne, eq, schema} from '@openint/db'
import {getServerUrl} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {core} from '../models'
import {
  authenticatedProcedure,
  customerProcedure,
  orgProcedure,
  router,
} from '../trpc/_base'
import {connectRouterModels} from './connect.models'
import {md} from './utils/md'

export const connectRouter = router({
  // TODO: Move create token in here...  and make sure createToken can contain
  // signed client options as well and have them override the client options from url params
  getMagicLink: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/magic-link',
        description:
          'Create a magic link that is ready to be shared with customers who want to use Connect',
        summary: 'Create Magic Link',
      },
    })
    .input(connectRouterModels.getMagicLinkInput.optional())
    .output(
      z.object({
        magic_link_url: z
          .string()
          .describe('The Connect magic link url to share with the user.'),
      }),
    )
    .query(async ({ctx, input}) => {
      // TODO: replace with new signing and persisting mechanism
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })
      if (!input || !input.customer_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Missing customer_id in path /customer/{customer_id}/magic-link',
        })
      }
      const token = await jwt.signViewer(
        asCustomerOfOrg(ctx.viewer, {customerId: input.customer_id as any}),
        {
          validityInSeconds: input.validity_in_seconds,
        },
      )

      const url = new URL('/connect', getServerUrl(null))
      url.searchParams.set('token', token)

      if (input.client_options) {
        for (const [key, value] of Object.entries(input.client_options)) {
          if (value !== undefined) {
            url.searchParams.set(key, value.toString())
          }
        }
      }

      return {
        magic_link_url: url.toString(),
      }
    }),
  preConnect: customerProcedure
    .meta({
      openapi: {enabled: false, method: 'POST', path: '/connect/pre-connect'},
    })
    .input(
      z.object({
        connector_config_id: zId('ccfg').describe(md`
          Must correspond to data.connector_name.
          Technically id should imply connector_name already but there is no way to
          specify a discriminated union with id alone.
        `),
        options: zConnectOptions,
        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        discriminated_data: discriminatedUnionBySchemaKey.pre_connect_input,
      }),
    )
    .output(discriminatedUnionBySchemaKey.connect_input)
    .query(async ({ctx, input}) => {
      const connectors = serverConnectors as Record<string, ConnectorServer>
      const connector = connectors[input.discriminated_data.connector_name]
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector ${input.discriminated_data.connector_name} not found`,
        })
      }
      const ccfg =
        await ctx.asOrgIfCustomer.db.query.connector_config.findFirst({
          where: eq(schema.connector_config.id, input.connector_config_id),
        })
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${input.connector_config_id} not found`,
        })
      }

      if (!ctx.viewer.orgId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'OrgId is required',
        })
      }

      const preConnect = connector.preConnect ?? (() => ({}))

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/await-thenable
      const res = await preConnect(
        ccfg.config,
        {
          webhookBaseUrl:
            'https://webhook.site/ce79fc9e-8f86-45f2-8701-749b770e5cdb',
          extCustomerId: (ctx.viewer.role === 'customer'
            ? ctx.viewer.customerId
            : ctx.viewer.userId) as ExtCustomerId,
          fetch: ctx.fetch,
        },
        input.discriminated_data.pre_connect_input,
      )

      return {
        connector_name: input.discriminated_data.connector_name,
        connect_input: res,
      }
    }),
  postConnect: customerProcedure
    .meta({
      openapi: {enabled: false, method: 'POST', path: '/connect/post-connect'},
    })
    .input(
      z.object({
        connector_config_id: zId('ccfg').describe(md`
          Must correspond to data.connector_name.
          Technically id should imply connector_name already but there is no way to
          specify a discriminated union with id alone.
        `),
        options: zPostConnectOptions,
        // Unable to put data at the top level due to
        // TRPCError: [mutation.preConnect] - Input parser must be a ZodObject
        discriminated_data: discriminatedUnionBySchemaKey.connect_output,
      }),
    )
    .output(core.connection)
    .mutation(async ({ctx, input}) => {
      console.log('postConnect', input, ctx)
      const connectors = serverConnectors as Record<string, ConnectorServer>
      const defs = defConnectors as Record<string, ConnectorDef>
      const connector = connectors[input.discriminated_data.connector_name]
      const def = defs[input.discriminated_data.connector_name]
      if (!connector || !def) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector ${input.discriminated_data.connector_name} not found`,
        })
      }
      const ccfg =
        await ctx.asOrgIfCustomer.db.query.connector_config.findFirst({
          where: eq(schema.connector_config.id, input.connector_config_id),
        })
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${input.connector_config_id} not found`,
        })
      }

      const postConnect =
        connector.postConnect ??
        ((output) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          settings: output,
          connectionExternalId: '', // TODO: Check on me....
        }))

      console.log('postConnect', input, ctx, ccfg)
      const connUpdate = await postConnect(
        input.discriminated_data.connect_output,
        ccfg.config,
        {
          webhookBaseUrl:
            'https://webhook.site/ce79fc9e-8f86-45f2-8701-749b770e5cdb',
          extCustomerId: (ctx.viewer.role === 'customer'
            ? ctx.viewer.customerId
            : ctx.viewer.userId) as ExtCustomerId,
          fetch: ctx.fetch,
        },
      )
      const id = makeId(
        'conn',
        input.discriminated_data.connector_name,
        makeUlid(),
      )

      // would be much nicer if this is the materialized schemas
      const zSettings = def.schemas.connectionSettings ?? z.object({}).strict()

      const settings = zSettings.parse(connUpdate.settings)

      const [conn] = await dbUpsertOne(
        // TODO: Update rls to allow customer to upsert their own connections
        ctx.asOrgIfCustomer.db,
        schema.connection,
        {
          id,
          settings,
          connector_config_id: input.connector_config_id,
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

  revokeConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/revoke',
      },
    })
    .input(z.object({id: z.string()}))
    .output(core.connection)
    .mutation(async ({ctx, input}) => {
      const conn = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!conn) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connection ${input.id} not found`,
        })
      }
      // Two requests instead of one to allow RLS to apply. Revoke is not a common operation
      const ccfg =
        await ctx.asOrgIfCustomer.db.query.connector_config.findFirst({
          where: eq(schema.connector_config.id, conn.connector_config_id),
        })
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${conn.connector_config_id} not found`,
        })
      }

      const connector = serverConnectors[
        conn.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector ${conn.connector_name} not found`,
        })
      }

      // TODO: Make me metter here
      const instance = connector.newInstance?.({
        config: ccfg.config,
        settings: conn.settings,
        fetchLinks: [],
        onSettingsChange: () => {},
      })

      await connector.revokeConnection?.(conn.settings, ccfg.config, instance)

      // TODO: make sure statis is updated
      return {
        ...conn!,
        customer_id: conn.customer_id!, // Fix me
      }
    }),
})
