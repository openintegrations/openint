import {swagger} from '@elysiajs/swagger'
import {Elysia} from 'elysia'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {
  createFetchHandlerOpenAPI,
  createFetchHandlerTRPC,
  type CreateFetchHandlerOptions,
} from './handlers'
import {generateOpenAPISpec} from './trpc/generateOpenAPISpec'

export interface CreateAppOptions
  extends Omit<CreateFetchHandlerOptions, 'endpoint' | 'router'> {}

// It's annoying how elysia does not really allow for dependency injection like TRPC, so we do ourselves
export function createApp({db}: CreateAppOptions) {
  const app = new Elysia()
    .get('/health', () => ({healthy: true}))
    .post('/health', (ctx) => ({healthy: true, body: ctx.body}))
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
      createFetchHandlerTRPC({endpoint: '/v1/trpc', db})(request),
    )
    .all('/v1/*', ({request}) =>
      createFetchHandlerOpenAPI({endpoint: '/v1', db})(request),
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
