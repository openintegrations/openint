import type {CreateFetchHandlerOptions} from './trpc/handlers'

import {cors} from '@elysiajs/cors'
import {swagger} from '@elysiajs/swagger'
import {Elysia} from 'elysia'
import {initDbNeon} from '@openint/db/db.neon'
import {env, envRequired, resolveRoute} from '@openint/env'
import {createOAuth2Server} from '@openint/oauth2/createOAuth2Server'
import {handleRefreshStaleConnections} from './jobs/refreshStaleConnections'
import {notifySlackError} from './lib/notifySlackError'
import {generateOpenAPISpec} from './trpc/generateOpenAPISpec'
import {
  createFetchHandlerOpenAPI,
  createFetchHandlerTRPC,
} from './trpc/handlers'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateAppOptions
  extends Omit<CreateFetchHandlerOptions, 'endpoint' | 'router'> {}

// It's annoying how elysia does not really allow for dependency injection like TRPC, so we do ourselves
export function createApp(opts: CreateAppOptions) {
  const app = new Elysia()
    .onError(async ({code, error}) => {
      await notifySlackError('Elysia crashed', {
        err: {message: String(error)},
        code: String(code),
      })
    })
    .use(cors())
    .get('/elysia/debug', ({query}) => {
      if (query['crash']) {
        throw new Error(query['crash'])
      }
      return {ok: true}
    })
    .get('/health', () => ({healthy: true}), {detail: {hide: true}})
    .post('/health', (ctx) => ({healthy: true, body: ctx.body}), {
      detail: {hide: true},
    })
    // TODO: Should this be made singular given that's what we do for all?
    .get('/jobs/refresh-stale-connections', handleRefreshStaleConnections, {
      detail: {hide: true},
    })
    .use(
      swagger({
        // TODO: Figure out why spec.content doesn't work. so we are forced tos specify url instead
        // and we need the /api prefix to work with next.js. This is really not ideal though.
        scalarConfig: {spec: {url: '/api/v1/openapi.json'}},
        path: '/v1',
      }),
    )
    .get('/v1/openapi.json', () => generateOpenAPISpec({}))
    // These two ways of mounting are very inconsistent, but I don't know why.
    // empirically, the first one without * works for trpc, and the second one with * works for openapi
    // no other settings seems to work when mounted inside next.js. Direct elysia listen works
    // in a more consistent way and we should probably add some test specifically for next.js mounted behavior
    .all('/v1/trpc/*', ({request}) =>
      createFetchHandlerTRPC({...opts, endpoint: '/v1/trpc'})(request),
    )
    .all('/v1/*', ({request}) =>
      createFetchHandlerOpenAPI({...opts, endpoint: '/v1'})(request),
    )

    // For testing purposes only
    .group('/acme-oauth2', (group) =>
      group.use(
        createOAuth2Server({
          // TODO: have a better way to unify this
          clients: [
            {
              id: 'client_1',
              name: 'client_1',
              secret: 'secret_1',
              redirectUris: [
                env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY,
                new URL(...resolveRoute('/connect/callback', null)).toString(),
              ],
              allowedGrants: [
                'authorization_code',
                'refresh_token',
                'client_credentials',
              ],
              scopes: [{name: 'read:profile'}, {name: 'write:posts'}],
            },
          ],
          scopes: [{name: 'read'}, {name: 'write'}],
          users: [{id: 'user_1', username: 'user_1', password: 'password_1'}],
          authCodes: [],
        }),
      ),
    )
  return app
}

// @ts-expect-error Property 'main' does not exist on type 'ImportMeta'.ts(2339)
if (import.meta.main) {
  const app = createApp({db: initDbNeon(envRequired.DATABASE_URL)})
  app.listen(process.env['PORT'] || 3002)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  )
}
