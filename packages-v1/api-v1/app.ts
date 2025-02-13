import {Elysia} from 'elysia'
import {
  handleOpenApiRequest,
  handleTrpcRequest,
} from './trpc/createRouteHandler'

export const app = new Elysia()
  .get('/health', () => ({status: 'ok'}))
  .mount('/api/v1', handleOpenApiRequest)
  .mount('/api/trpc', handleTrpcRequest)

async function main() {
  const res = await app.handle(new Request('http://localhost/api/v1/health'))
  console.log(await res.json())

  const res2 = await app.handle(new Request('http://localhost/api/trpc/health'))
  console.log(await res2.json())
}
void main()
