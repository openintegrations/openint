import type {
  ConnectionUpdate,
  CustomerId,
  OauthBaseTypes,
  Viewer,
} from '@openint/cdk'
import {
  makeId,
  makeOauthConnectorServer,
  zConnectOptions,
  zCustomerId,
  zId,
  zPostConnectOptions,
} from '@openint/cdk'
import {adminProcedure, TRPCError} from '@openint/trpc'
import {joinPath, z} from '@openint/util'
import {inngest} from '../inngest'
import {parseWebhookRequest} from '../parseWebhookRequest'
import {protectedProcedure, trpc} from './_base'

export {type inferProcedureInput} from '@openint/trpc'

export const zConnectTokenPayload = z.object({
  customerId: zCustomerId
    .optional() // Optional because when creating magic link as current customer we dont' need it...
    .describe(
      'Anything that uniquely identifies the customer that you will be sending the magic link to',
    ),
  validityInSeconds: z
    .number()
    .default(30 * 24 * 60 * 60)
    .describe(
      'How long the magic link will be valid for (in seconds) before it expires',
    ),
})

export const zConnectPageParams = z.object({
  token: z.string(),
  displayName: z.string().nullish().describe('What to call user by'),
  redirectUrl: z
    .string()
    .nullish()
    .describe(
      'Where to send user to after connect / if they press back button',
    ),
  // TODO: How to make sure we actually have a typed api here and can use zProviderName
  connectorNames: z
    .string()
    .nullish()
    .describe('Filter integrations by comma separated connector names'),
  integrationIds: z
    .string()
    .nullish()
    .describe('Filter integrations by comma separated integration ids'),
  connectionId: zId('conn')
    .nullish()
    .describe('Filter managed connections by connection id'),
  theme: z
    .enum(['light', 'dark'])
    .nullish()
    .describe('Magic Link display theme'),
  view: z
    .enum(['manage', 'manage-deeplink', 'add', 'add-deeplink'])
    .nullish()
    .describe('Magic Link tab view'),
})

export const zFilePickerParams = z.object({
  theme: z.enum(['light', 'dark']).nullish(),
  multiSelect: z.boolean().nullish(),
  folderSelect: z.boolean().nullish(),
  themeColors: z
    .object({
      accent: z.string().nullish(),
      background: z.string().nullish(),
      border: z.string().nullish(),
      button: z.string().nullish(),
      buttonLight: z.string().nullish(),
      buttonForeground: z.string().nullish(),
      buttonHover: z.string().nullish(),
      buttonStroke: z.string().nullish(),
      buttonSecondary: z.string().nullish(),
      buttonSecondaryForeground: z.string().nullish(),
      buttonSecondaryStroke: z.string().nullish(),
      buttonSecondaryHover: z.string().nullish(),
      card: z.string().nullish(),
      cardForeground: z.string().nullish(),
      foreground: z.string().nullish(),
      navbar: z.string().nullish(),
      primary: z.string().nullish(),
      primaryForeground: z.string().nullish(),
      secondary: z.string().nullish(),
      secondaryForeground: z.string().nullish(),
      sidebar: z.string().nullish(),
      tab: z.string().nullish(),
    })
    .nullish(),
  connectionId: zId('conn'),
  validityInSeconds: z
    .number()
    .default(30 * 24 * 60 * 60)
    .describe(
      'How long the magic link will be valid for (in seconds) before it expires',
    ),
})

/**
 * Workaround to be able to re-use the schema on the frontend for now
 * @see https://github.com/trpc/trpc/issues/4295
 *
 * Though if we can FULLY automate the generate of forms perhaps this wouldn't actually be necessary?
 * We will have to make sure though that the router themselves do not have any side effect imports
 * and all server-specific logic would be part of context.
 * But then again client side bundle size would still be a concern
 * as we'd be sending server side code unnecessarily to client still
 * unless of course we transform zod -> jsonschema and send that to the client only
 * via a trpc schema endpoint (with server side rendering of course)
 */
export const customerRouterSchema = {
  createConnectToken: {input: zConnectTokenPayload},
  createMagicLink: {
    input: zConnectTokenPayload.merge(zConnectPageParams.omit({token: true})),
  },
  createFilePickerLink: {
    input: zConnectTokenPayload.merge(zFilePickerParams),
  },
} satisfies Record<string, {input?: z.ZodTypeAny; output?: z.ZodTypeAny}>

// MARK: - Helpers

function asCustomer(
  viewer: Viewer,
  input: {customerId?: CustomerId | null},
): Viewer<'customer'> {
  // console.log('[asCustomer]', viewer, input)
  // Figure out a better way to share code here...
  if (!('orgId' in viewer) || !viewer.orgId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Current viewer missing orgId to create token',
    })
  }
  if (
    viewer.role === 'customer' &&
    input.customerId &&
    input.customerId !== viewer.customerId
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Current viewer cannot create token for other customer',
    })
  }
  const customerId =
    viewer.role === 'customer' ? viewer.customerId : input.customerId
  if (!customerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Either call as an customer or pass customerId explicitly',
    })
  }

  return {role: 'customer', customerId, orgId: viewer.orgId}
}

// MARK: - Endpoints

const tags = ['Connect']

/** TODO: Modify this so that admin user can execute it... not just customer */
export const customerRouter = trpc.router({
  createConnectToken: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/token',
        tags,
      },
    })
    .input(customerRouterSchema.createConnectToken.input)
    .output(z.object({token: z.string()}))
    .mutation(({input: {validityInSeconds, ...input}, ctx}) =>
      // console.log('[createConnectToken]', ctx.viewer, input, {
      //   validityInSeconds,
      // })
      ({
        token: ctx.jwt.signViewer(asCustomer(ctx.viewer, input), {
          validityInSeconds,
        }),
      }),
    ),
  createMagicLink: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/magic-link',
        tags,
      },
    })
    .input(customerRouterSchema.createMagicLink.input)
    .output(z.object({url: z.string()}))
    .mutation(({input: {customerId, validityInSeconds, ...params}, ctx}) => {
      const token = ctx.jwt.signViewer(asCustomer(ctx.viewer, {customerId}), {
        validityInSeconds,
      })
      // Mapping integrationIds and connectorNames to a clean format removing any extra spaces
      // and ensuring they are prefixed with int_ if they are in the format of connectorName_integrationId.
      const mappedParams = {
        ...params,
        token,
        integrationIds: params.integrationIds?.split(',').map((id) => {
          const trimmedId = id.trim()

          return trimmedId.includes('_') &&
            trimmedId.split('_').length === 2 &&
            !trimmedId.startsWith('int_')
            ? `int_${trimmedId}`
            : trimmedId
        }),
        connectorNames: params.connectorNames
          ?.split(',')
          .map((name) => name.trim()),
        theme: params.theme ?? 'light',
        view: params.view ?? 'add',
      }

      const url = new URL('/connect/portal', ctx.apiUrl) // `/` will start from the root hostname itself
      for (const [key, value] of Object.entries(mappedParams)) {
        if (value) {
          url.searchParams.set(key, `${value ?? ''}`)
        }
      }
      return {url: url.toString()}
    }),
  createFilePickerLink: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connect/file-picker',
        tags,
      },
    })
    .input(customerRouterSchema.createFilePickerLink.input)
    .output(z.object({url: z.string()}))
    .mutation(
      async ({input: {validityInSeconds, themeColors, ...params}, ctx}) => {
        const connection = await ctx.services.getConnectionOrFail(
          params.connectionId,
        )

        const token = ctx.jwt.signViewer(
          asCustomer(ctx.viewer, {customerId: connection.customerId}),
          {
            validityInSeconds,
          },
        )

        const url = new URL('/connect/file-picker', ctx.apiUrl)
        url.searchParams.set('token', token)
        url.searchParams.set('connection_id', params.connectionId)
        url.searchParams.set('theme', params.theme ?? 'light')
        if (params.multiSelect) {
          url.searchParams.set('multi_select', params.multiSelect.toString())
        }
        if (params.folderSelect) {
          url.searchParams.set('folder_select', params.folderSelect.toString())
        }

        // Add theme colors if provided
        if (themeColors) {
          Object.entries(themeColors).forEach(([key, value]) => {
            if (value) {
              // Convert camelCase to snake_case for URL params
              const paramKey = key.replace(
                /[A-Z]/g,
                (letter) => `_${letter.toLowerCase()}`,
              )
              url.searchParams.set(`theme_colors.${paramKey}`, value)
            }
          })
        }

        return {url: url.toString()}
      },
    ),

  // MARK: - Connect
  preConnect: protectedProcedure
    .input(z.tuple([zId('ccfg'), zConnectOptions, z.unknown()]))
    // Consider using sessionId, so preConnect corresponds 1:1 with postConnect
    .query(
      async ({
        input: [ccfgId, {connectionExternalId, ...connCtxInput}, preConnInput],
        ctx,
      }) => {
        const int = await ctx.asOrgIfNeeded.getConnectorConfigOrFail(ccfgId)
        if (!int.connector.preConnect) {
          return null
        }
        const conn = connectionExternalId
          ? await ctx.services.getConnectionOrFail(
              makeId('conn', int.connector.name, connectionExternalId),
            )
          : undefined
        return int.connector.preConnect?.(
          int.config,
          {
            ...connCtxInput,
            extCustomerId: ctx.extCustomerId,
            connection: conn
              ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                {externalId: connectionExternalId!, settings: conn.settings}
              : undefined,
            webhookBaseUrl: joinPath(
              ctx.apiUrl,
              parseWebhookRequest.pathOf(int.id),
            ),
            redirectUrl: ctx.getRedirectUrl?.(int, {
              customerId:
                ctx.viewer.role === 'customer' ? ctx.viewer.customerId : null,
            }),
          },
          preConnInput,
        )
      },
    ),
  // useConnectHook happens client side only
  // for cli usage, can just call `postConnect` directly. Consider making the
  // flow a bit smoother with a guided cli flow
  postConnect: protectedProcedure
    .input(z.tuple([z.unknown(), zId('ccfg'), zPostConnectOptions]))
    // Questionable why `zConnectContextInput` should be there. Examine whether this is actually
    // needed
    // How do we verify that the userId here is the same as the userId from preConnectOption?

    .mutation(
      async ({
        input: [input, ccfgId, {connectionExternalId, ...connCtxInput}],
        ctx,
      }) => {
        const int = await ctx.asOrgIfNeeded.getConnectorConfigOrFail(ccfgId)
        console.log('didConnect start', int.connector.name, input, connCtxInput)

        // TODO: we should make it possible for oauth connectors to
        // ALSO handle custom postConnect... This would be very handy for xero for instance
        const connUpdate = await (async () => {
          if (
            !int.connector.postConnect &&
            int.connector.metadata?.nangoProvider
          ) {
            return (await makeOauthConnectorServer({
              nangoClient: ctx.nango,
              ccfgId,
              nangoProvider: int.connector.metadata.nangoProvider,
            }).postConnect(input as OauthBaseTypes['connectOutput'])) as Omit<
              ConnectionUpdate<any, any>,
              'customerId'
            >
          }

          if (
            !int.connector.postConnect ||
            !int.connector.schemas.connectOutput
          ) {
            return null
          }

          const conn = connectionExternalId
            ? await ctx.services.getConnectionOrFail(
                makeId('conn', int.connector.name, connectionExternalId),
              )
            : undefined

          if (
            int.connector &&
            conn &&
            !conn.integrationId &&
            connCtxInput.integrationId
          ) {
            // setting the integrationId so that the connection can be associated with the integration
            conn.integrationId = connCtxInput.integrationId
          }

          return await int.connector.postConnect(
            int.connector.schemas.connectOutput.parse(input),
            int.config,
            {
              ...connCtxInput,
              extCustomerId: ctx.extCustomerId,
              connection: conn
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  {externalId: connectionExternalId!, settings: conn.settings}
                : undefined,
              webhookBaseUrl: joinPath(
                ctx.apiUrl,
                parseWebhookRequest.pathOf(int.id),
              ),
              redirectUrl: ctx.getRedirectUrl?.(int, {
                customerId:
                  ctx.viewer.role === 'customer' ? ctx.viewer.customerId : null,
              }),
            },
          )
        })()

        if (!connUpdate) {
          return {
            message: 'Noop',
            connectionId: null,
          }
        }

        const syncInBackground =
          connUpdate.triggerDefaultSync !== false && !connCtxInput.syncInBand
        const triggerDefaultSync =
          !syncInBackground && connUpdate.triggerDefaultSync !== false
        // console.log(
        //   'connUpdate at postConnect syncInBackground',
        //   syncInBackground,
        //   connCtxInput,
        //   connUpdate,
        //   {
        //     triggerDefaultSync:
        //       !syncInBackground && connUpdate.triggerDefaultSync !== false,
        //   },
        // )

        const {connection_id: connectionId} =
          await ctx.asOrgIfNeeded._syncConnectionUpdate(int, {
            ...connUpdate,
            // No need for each connector to worry about this, unlike in the case of handleWebhook.
            customerId:
              ctx.viewer.role === 'customer' ? ctx.viewer.customerId : null,
            triggerDefaultSync,
            settings: {
              ...connUpdate?.settings,
              error: connUpdate?.settings?.['error'] || null,
            },
          })

        if (process.env['NEXT_PUBLIC_RUNTIME_ENV'] === 'edge') {
          console.log('[postConnect] skipping inngest for edge runtime')
          return 'Connection successfully connected'
        }

        // await inngest.send({
        //   name: 'connect/connection-connected',
        //   data: {connectionId},
        // })

        // if (syncInBackground) {
        //   await ctx.inngest.send({
        //     name: 'sync/connection-requested',
        //     data: {connectionId},
        //   })
        // }
        console.log(
          'didConnect finish',
          int.connector.name,
          input,
          `syncInBackground: ${syncInBackground}`,
          `triggerDefaultSync: ${triggerDefaultSync}`,
        )
        return {
          connectionId,
          message: 'Connection successfully connected',
        }
      },
    ),
  upsertCustomer: adminProcedure
    .meta({
      openapi: {method: 'PUT', path: '/core/customer/{id}', tags: ['Core']},
    })
    .input(z.object({id: z.string(), metadata: z.unknown()}))
    .output(
      z.object({
        id: z.string(),
        orgId: z.string(),
        metadata: z.unknown(),
      }),
    )
    .mutation(({input: {id, metadata}, ctx}) => {
      console.log('createCustomer', ctx.viewer, id, metadata)
      return {
        id,
        orgId: ctx.viewer.orgId + '',
        metadata,
      }
    }),
})
