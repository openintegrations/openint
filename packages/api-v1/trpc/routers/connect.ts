import type {
  ConnectionUpdate,
  ConnectorDef,
  ConnectorServer,
  ExtCustomerId,
} from '@openint/cdk'

import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {discriminatedUnionBySchemaKey} from '@openint/all-connectors/schemas'
import {makeId, zConnectOptions, zId, zPostConnectOptions} from '@openint/cdk'
import {dbUpsertOne, eq, schema} from '@openint/db'
import {getBaseURLs, resolveRoute} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {
  authenticatedProcedure,
  customerProcedure,
  orgProcedure,
  router,
} from '../_base'
import {asCustomerOfOrg, makeJwtClient} from '../../lib/makeJwtClient'
import {getAbsoluteApiV1URL} from '../../lib/typed-routes'
import {connection_select_base, core} from '../../models'
import {connectRouterModels} from './connect.models'
import {
  checkConnection,
  connectionCanBeChecked,
} from './utils/connectionChecker'
import {md} from './utils/md'
import {zConnectionId} from './utils/types'

export const connectRouter = router({
  // TODO: Should these all be scoped under `/connect` instead?
  createMagicLink: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/magic-link',
        description:
          'Create a @Connect magic link that is ready to be shared with customers who want to use @Connect',
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
      const token = await jwt.signToken(
        asCustomerOfOrg(ctx.viewer, {customerId: input.customer_id as any}),
        {
          validityInSeconds: input.validity_in_seconds,
          connectOptions: input.connect_options,
        },
      )

      const url = new URL(...resolveRoute('/connect', null))
      url.searchParams.set('token', token)

      return {
        magic_link_url: url.toString(),
      }
    }),
  createToken: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/token',
        description:
          'Create a @Connect authentication token for a customer. This token can be used to embed @Connect in your application via the `@openint/connect` npm package.',
        summary: 'Create Customer Authentication Token',
      },
    })
    .input(connectRouterModels.createTokenInput)
    .output(
      z.object({
        token: z
          .string()
          .describe('The authentication token to use for API requests'),
      }),
    )
    .query(async ({ctx, input}) => {
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })

      if (!input || !input.customer_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing customer_id in path /customer/{customer_id}/token',
        })
      }

      const token = await jwt.signToken(
        asCustomerOfOrg(ctx.viewer, {customerId: input.customer_id as any}),
        {
          validityInSeconds: input.validity_in_seconds,
          connectOptions: input.connect_options,
        },
      )

      return {token}
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
      // @pellicceama: Have another way to validate
      // const connectorNamesFromToken =
      //   ctx.viewer?.connectOptions?.connector_names ?? []
      // if (
      //   connectorNamesFromToken.length > 0 &&
      //   !connectorNamesFromToken.includes(
      //     input.discriminated_data.connector_name as ConnectorName,
      //   )
      // ) {
      //   throw new TRPCError({
      //     code: 'UNAUTHORIZED',
      //     message: `You are not authorized to connect to ${input.discriminated_data.connector_name}`,
      //   })
      // }
      const connector = serverConnectors[
        input.discriminated_data.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer
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

      const context = {
        webhookBaseUrl: getAbsoluteApiV1URL(`/webhook/${ccfg.connector_name}`),
        extCustomerId: (ctx.viewer.role === 'customer'
          ? ctx.viewer.customerId
          : ctx.viewer.userId) as ExtCustomerId,
        connectionExternalId: input.options?.connectionExternalId,
        fetch: ctx.fetch,
        baseURLs: getBaseURLs(null),
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const instance = connector.newInstance?.({
        config: ccfg.config,
        settings: undefined,
        context,
        fetchLinks: [],
        onSettingsChange: () => {}, // noop
      })

      // eslint-disable-next-line @typescript-eslint/await-thenable
      const res = await preConnect({
        config: ccfg.config,
        instance,
        context,
        input: input.discriminated_data.pre_connect_input,
      })

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
    .output(core.connection_select)
    .mutation(async ({ctx, input}) => {
      // @pellicceama: Have another way to validate
      // const connectorNamesFromToken =
      //   ctx.viewer?.connectOptions?.connector_names ?? []
      // if (
      //   connectorNamesFromToken.length > 0 &&
      //   !connectorNamesFromToken.includes(
      //     input.discriminated_data.connector_name as ConnectorName,
      //   )
      // ) {
      //   throw new TRPCError({
      //     code: 'UNAUTHORIZED',
      //     message: `You are not authorized to connect to ${input.discriminated_data.connector_name}`,
      //   })
      // }

      const defs = defConnectors as Record<string, ConnectorDef>
      const connector = serverConnectors[
        input.discriminated_data.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer
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
        (({connectOutput}): ConnectionUpdate => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          settings: connectOutput,
          connectionExternalId: '', // TODO: Check on me....
        }))

      const context = {
        webhookBaseUrl: getAbsoluteApiV1URL(`/webhook/${ccfg.connector_name}`),
        extCustomerId: (ctx.viewer.role === 'customer'
          ? ctx.viewer.customerId
          : ctx.viewer.userId) as ExtCustomerId,
        fetch: ctx.fetch,
        baseURLs: getBaseURLs(null),
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const instance = connector.newInstance?.({
        config: ccfg.config,
        settings: undefined,
        context,
        fetchLinks: [],
        onSettingsChange: () => {}, // noop
      })

      const connUpdate = await postConnect({
        connectOutput: input.discriminated_data.connect_output,
        config: ccfg.config,
        instance,
        context,
      })
      const id = makeId(
        'conn',
        input.discriminated_data.connector_name,
        connUpdate.connectionExternalId || makeUlid(),
      )

      // would be much nicer if this is the materialized schemas
      const zSettings = def.schemas.connection_settings ?? z.object({}).strict()

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
          status: connUpdate.status,
          status_message: connUpdate.status_message,
          // add integration id
        },
        {keyColumns: ['id']},
      ).returning()

      await ctx.dispatch({
        name: 'connect.connection-connected',
        data: {connection_id: conn!.id as `conn_${string}`},
      })

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
  // TODO: Move to connect.ts
  checkConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connection/{id}/check',
        description: 'Verify that a connection is healthy',
        summary: 'Check Connection Health',
      },
    })
    .input(z.object({id: zConnectionId}))
    .output(
      connection_select_base
        .pick({
          id: true,
          status: true,
          status_message: true,
        })
        .extend({
          // check_result: z.enum(['token', 'disconnected', 'unknown']),
        }),
    )
    .mutation(async ({ctx, input}) => {
      const conn = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!conn || !conn.connector_config_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      if (!connectionCanBeChecked(conn)) {
        // mock a healthy connection but don't save it to the database
        return {
          id: conn.id as `conn_${string}`,
          status: 'healthy',
          status_message: null,
        }
      }
      return checkConnection(conn, ctx)
    }),
  revokeConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/revoke',
        enabled: false,
      },
    })
    .input(z.object({id: z.string()}))
    .output(core.connection_select)
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
          where: eq(schema.connector_config.id, conn.connector_config_id!),
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
      const context = {
        webhookBaseUrl: getAbsoluteApiV1URL(`/webhook/${ccfg.connector_name}`),
        extCustomerId: (ctx.viewer.role === 'customer'
          ? ctx.viewer.customerId
          : ctx.viewer.userId) as ExtCustomerId,
        fetch: ctx.fetch,
        baseURLs: getBaseURLs(null),
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const instance = connector.newInstance?.({
        config: ccfg.config,
        settings: undefined,
        context,
        fetchLinks: [],
        onSettingsChange: () => {}, // noop
      })

      await connector.revokeConnection?.({
        settings: conn.settings,
        config: ccfg.config,
        instance,
      })

      const [updatedConn] = await ctx.asOrgIfCustomer.db
        .update(schema.connection)
        .set({
          status: 'disconnected',
          status_message: 'Connection was revoked via OpenInt',
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.connection.id, conn.id))
        .returning()

      // TODO: make sure statis is updated
      return updatedConn!
    }),
})
