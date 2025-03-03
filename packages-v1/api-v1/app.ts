import {swagger} from '@elysiajs/swagger'
import {Elysia} from 'elysia'
import type {Database} from '@openint/db-v1'
import {
  createDatabase,
  createNeonHttpDatabase,
  createNeonWebSocketDatabase,
} from '@openint/db-v1'
import {envRequired} from '@openint/env'
import {createFetchHandlerOpenAPI, createFetchHandlerTRPC} from './trpc/handlers'
import {generateOpenAPISpec} from './trpc/openapi'

async function checkLatency(db: Database) {
  const start = new Date()
  await db.execute('SELECT 1')
  const durationMs = Date.now() - start.getTime()
  return durationMs
}

export const app = new Elysia({prefix: '/api'})
  .get('/check-latency', async () => {
    const postgresJsLatencyMs = await checkLatency(
      createDatabase({url: envRequired.DATABASE_URL}),
    )
    const neonWebsocketLatencyMs = await checkLatency(
      createNeonWebSocketDatabase({
        url: envRequired.DATABASE_URL,
      }) as unknown as Database,
    )
    const neonHttpLatencyMs = await checkLatency(
      createNeonHttpDatabase({
        url: envRequired.DATABASE_URL,
      }) as unknown as Database,
    )
    return {
      postgresJsLatencyMs,
      neonHttpLatencyMs,
      neonWebsocketLatencyMs,
    }
  })
  .get('/health', () => ({healthy: true}))
  .use(
    swagger({
      // For some reason spec.content doesn't work. so we are forced tos specify url instead
      scalarConfig: {spec: {url: '/api/v1/openapi.json'}},
      path: '/v1',
    }),
  )
  .get('/v1/openapi.json', () => generateOpenAPISpec({}))
  // These two ways of mounting are very inconsistent, but I don't know why.
  // empirically, the first one without * works for trpc, and the second one with * works for openapi
  // no other settings seems to work when mounted inside next.js. Direct elysia listen works
  // in a more consistent way and we should probably add some test specifically for next.js mounted behavior
  .mount('/v1/trpc', createFetchHandlerTRPC({endpoint: '/trpc'}))
  .mount('/v1*', createFetchHandlerOpenAPI({endpoint: '/v1'}))

// @ts-expect-error Property 'main' does not exist on type 'ImportMeta'.ts(2339)
if (import.meta.main) {
  app.listen(process.env['PORT'] || 3002)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  )
}
