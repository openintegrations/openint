import {Elysia} from 'elysia'
import {
  handleOpenApiRequest,
  handleTrpcRequest,
} from './trpc/createRouteHandler'

export const app = new Elysia()
  .get('/health', () => ({status: 'ok'}))
  .mount('/api/v1', handleOpenApiRequest)
  .mount('/api/trpc', handleTrpcRequest)

// @ts-expect-error Property 'main' does not exist on type 'ImportMeta'.ts(2339)
if (import.meta.main) {
  app.listen(process.env['PORT'] || 3002)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  )
}
