import type {RequestLike} from '@clerk/nextjs/dist/types/server/types'
import {clerkClient, getAuth} from '@clerk/nextjs/server'
import {createOpenApiFetchHandler} from '@lilyrose2798/trpc-openapi'
import {applyLinks, corsLink} from '@opensdks/fetch-links'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {pickBy} from 'remeda'
import {contextFactory} from '@openint/app-config/backendConfig'
import {
  kAccessToken,
  kApikeyHeader,
  kApikeyMetadata,
  kApikeyUrlParam,
} from '@openint/app-config/constants'
import type {Id, UserId, Viewer} from '@openint/cdk'
import {
  decodeApikey,
  getRemoteContext,
  makeJwtClient,
  zCustomerId,
  zId,
} from '@openint/cdk'
import type {RouterContext} from '@openint/engine-backend'
import {envRequired} from '@openint/env'
import {downloadFileById} from '@openint/unified-file-storage/adapters'
import {
  BadRequestError,
  getHTTPResponseFromError,
  getProtectedContext,
  isHttpError,
  TRPCError,
  z,
  type AnyRouter,
} from '@openint/vdk'

export const zOpenIntHeaders = z
  .object({
    [kApikeyHeader]: z.string().nullish(),
    'x-connection-id': zId('conn').nullish(),
    /** Alternative ways to pass the connection id, works in case there is a single connector */
    'x-connection-connector-name': z.string().nullish(),
    'x-connection-connector-config-id': zId('ccfg').nullish(),
    /** Implied by authorization header when operating in customer mode */
    'x-connection-customer-id': zCustomerId.nullish(),
    authorization: z.string().nullish(), // `Bearer ${string}`
  })
  .catchall(z.string().nullish())

export type OpenIntHeaders = z.infer<typeof zOpenIntHeaders>

/** Determine the current viewer in this order
 * access token via query param
 * access token via header
 * apiKey via query param
 * api key via header
 * next.js cookie
 * fall back to anon viewer
 * TODO: Figure out how to have the result of this function cached for the duration of the request
 * much like we cache
// TODO: Dedupe me with serverGetViewer
 */
export async function viewerFromRequest(
  req: Request,
  // This is a hack for not knowing how else to return accessToken...
  // and not wanting it to add it to the super simple viewer interface just yet
  // Fwiw this is only used for the /connect experience and not generally otherwise
): Promise<Viewer & {accessToken?: string | null}> {
  const jwt = makeJwtClient({
    secretOrPublicKey: envRequired.JWT_SECRET,
  })

  // console.log('headers', headers)
  // console.log('searchParams', searchParams)

  const url = new URL(req.url)

  // access token via query param
  let accessToken = url.searchParams.get(kAccessToken) ?? undefined

  let viewer = jwt.verifyViewer(accessToken)
  if (viewer.role !== 'anon') {
    return {...viewer, accessToken}
  }
  // access token via header
  accessToken = req.headers.get('authorization')?.match(/^Bearer (.+)/)?.[1]
  viewer = jwt.verifyViewer(accessToken)
  if (viewer.role !== 'anon') {
    return {...viewer, accessToken}
  }

  // personal access token via query param or header
  const apikey =
    url.searchParams.get(kApikeyUrlParam) || req.headers.get(kApikeyHeader)

  // No more api keys, gotta fix me here.
  if (apikey) {
    const [id, key] = decodeApikey(apikey)

    const res = id.startsWith('user_')
      ? await clerkClient.users.getUser(id)
      : id.startsWith('org_')
        ? await clerkClient.organizations.getOrganization({organizationId: id})
        : null

    // console.log('apikey', {apiKey: apikey, id, key, res})

    if (res?.privateMetadata?.[kApikeyMetadata] === key) {
      return res.id.startsWith('user_')
        ? {role: 'user', userId: res.id as Id['user']}
        : {role: 'org', orgId: res.id as Id['org']}
    }
    // console.warn('Invalid api key, ignoroing', {apiKey: apikey, id, key, res})
  }

  /** Almost a NextRequest... */
  const auth = getAuth(req as RequestLike)

  // console.log('auth', auth)
  if (auth.userId) {
    return {
      role: 'user',
      userId: auth.userId as UserId,
      orgId: auth.orgId as Id['org'],
    }
  }

  return {role: 'anon'}
}

export const contextFromRequest = async ({
  req,
}: {
  req: Request
}): Promise<RouterContext> => {
  const viewer = await viewerFromRequest(req)
  const context = contextFactory.fromViewer(viewer)
  const headers = zOpenIntHeaders.parse(
    Object.fromEntries(req.headers.entries()),
  )
  let connectionId = req.headers.get('x-connection-id') as
    | Id['conn']
    | undefined
  if (!connectionId) {
    // TODO: How do we allow filtering for organization owned connections?
    // Specifically making sure that customerId = null?
    // TODO: make sure this corresponds to the list connections api
    const connectionFilters = pickBy(
      {
        // customerId shall be noop when we are in end User viewer as services
        // are already secured by row level security
        customerId: headers['x-connection-customer-id'],
        connectorName: headers['x-connection-connector-name'],
        connectorConfigId: headers['x-connection-connector-config-id'],
      },
      (v) => v != null,
    )
    if (Object.keys(connectionFilters).length > 0) {
      const connections =
        await context.services.metaService.tables.connection.list({
          ...connectionFilters,
          limit: 2,
        })
      if (connections.length > 1) {
        throw new BadRequestError(
          `Multiple connections found for filter: ${JSON.stringify(
            connectionFilters,
          )}`,
        )
      }
      connectionId = connections[0]?.id
    }
  }
  console.log('[contextFromRequest]', {url: req.url, viewer, connectionId})
  return {
    ...context,
    remoteConnectionId: connectionId ?? null,
  }
}

export function createRouterTRPCHandler({
  endpoint,
  router,
}: {
  endpoint: `/${string}`
  router: AnyRouter
}) {
  return async (req: Request) => {
    const context = await contextFromRequest({req})

    const res = await fetchRequestHandler({
      endpoint,
      req,
      router,
      createContext: () => context,
    })

    return res
  }
}

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD'

type SkipTrpcRoutes = {
  [method in HttpMethod]?: {
    [route: string]: (req: Request, ctx: RouterContext) => Promise<Response>
  }
}

const skipTrpcRoutes: SkipTrpcRoutes = {
  GET: {
    '/api/v0/unified/file-storage/file/{fileId}/download': async (
      req: Request,
      ctx: RouterContext,
    ) => {
      if (!ctx.remoteConnectionId) {
        throw new BadRequestError('No Connection Found')
      }
      const connection = await ctx.services.metaService.tables.connection.get(
        ctx.remoteConnectionId,
      )
      if (!connection) {
        throw new BadRequestError('No Connection Found For Download')
      }

      const urlParts = new URL(req.url).pathname.split('/')
      const fileId = urlParts.filter((part) => part).slice(-2, -1)[0]

      if (!fileId) {
        throw new BadRequestError('No fileId found in path')
      }

      if (!(connection.connectorName in downloadFileById)) {
        throw new BadRequestError(
          `Download not supported for ${connection.connectorName}`,
        )
      }
      const downloadFn =
        downloadFileById[
          connection.connectorName as keyof typeof downloadFileById
        ]

      // TODO: abstract so its not fetched in every handler
      const protectedContext = getProtectedContext(ctx)
      const remoteContext = await getRemoteContext(protectedContext)

      const {resHeaders, status, error, stream} = await downloadFn({
        fileId,
        ctx: remoteContext,
      })

      if (status !== 200 || error || !stream) {
        return new Response(JSON.stringify(error), {
          status,
        })
      }

      return new Response(stream, {status, headers: resHeaders})
    },
  },
}

export function createRouterOpenAPIHandler({
  endpoint,
  router,
}: {
  endpoint: `/${string}`
  router: AnyRouter
}) {
  const openapiRouteHandler = async (req: Request) => {
    // Respond to CORS preflight requests
    // TODO: Turn this into a fetch link...
    const corsHeaders = {
      'Access-Control-Allow-Credentials': 'true',
      // Need to use the request origin for credentials-mode "include" to work
      'Access-Control-Allow-Origin': req.headers.get('origin') ?? '*',
      // prettier-ignore
      'Access-Control-Allow-Methods': req.headers.get('access-control-request-method') ?? '*',
      // prettier-ignore
      'Access-Control-Allow-Headers': req.headers.get('access-control-request-headers')?? '*',
    }
    if (req.method.toUpperCase() === 'OPTIONS') {
      return new Response(null, {status: 204, headers: corsHeaders})
    }
    // Now handle for reals
    try {
      const context = await contextFromRequest({req})

      const skipRoutes =
        skipTrpcRoutes[req.method as keyof typeof skipTrpcRoutes]
      if (skipRoutes) {
        const pathname = new URL(req.url).pathname
        for (const [route, handler] of Object.entries(skipRoutes)) {
          const regex = new RegExp(
            '^' + route.replace(/{[^}]+}/g, '[^/]+') + '$',
          )
          if (regex.test(pathname)) {
            console.log('skipping trpc route', route)
            return handler(req, context)
          }
        }
      }
      // More aptly named handleOpenApiFetchRequest as it returns a response already
      const res = await createOpenApiFetchHandler({
        endpoint,
        req,
        router: router as any,
        createContext: () => context,
        // TODO: handle error status code from passthrough endpoints
        // onError, // can only have side effect and not modify response error status code unfortunately...
        responseMeta: ({errors, ctx: _ctx, data}) => {
          console.log('res data', data)
          // Pass the status along
          for (const err of errors) {
            console.warn(
              '[TRPCError]',
              {
                // customerId: ctx?.headers.get('x-customer-id'),
                // providerName: ctx?.headers.get('x-provider-name'),
              },
              err,
            )
            if (isHttpError(err.cause)) {
              // Maybe rename this to status within the error object?
              return {status: err.cause.code}
            }
          }
          return {}
        },
      })
      // Pass the connectionId back to the client so there is certainly on which ID
      // was used to fetch the data
      if (context.remoteConnectionId) {
        res.headers.set('x-connection-id', context.remoteConnectionId)
      }

      for (const [k, v] of context.resHeaders.entries()) {
        console.log('setting resHeader header', k, v)
        res.headers.set(k, v)
      }

      for (const [k, v] of Object.entries(corsHeaders)) {
        res.headers.set(k, v)
      }

      return res
    } catch (err) {
      console.error('[trpc.createRouterHandler] error', err)
      if (err instanceof TRPCError) {
        const ret = await getHTTPResponseFromError(err)
        return new Response(JSON.stringify(ret.body), {
          status: ret.status,
          headers: {'Content-Type': 'application/json'},
        })
      }
      throw err
    }
  }
  return (req: Request) => applyLinks(req, [corsLink(), openapiRouteHandler])
}
