import {swagger} from '@elysiajs/swagger'
import {Elysia} from 'elysia'
import {openApiDocument} from './trpc/routers'
import {
  handleOpenApiRequest,
  handleTrpcRequest,
} from './trpc/handlers'

export const app = new Elysia()
  .get('/health', () => ({status: 'ok'}))
  .get('/api/v1/openapi.json', () => openApiDocument)
  .mount('/api/v1', handleOpenApiRequest)
  .mount('/api/trpc', handleTrpcRequest)
  .use(
    swagger({
      // For some reason spec.content doesn't work. so we are forced tos specify url instead
      scalarConfig: {spec: {url: '/api/v1/openapi.json'}},
      path: '/',
    }),
  )

// @ts-expect-error Property 'main' does not exist on type 'ImportMeta'.ts(2339)
if (import.meta.main) {
  app.listen(process.env['PORT'] || 3002)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  )
}
