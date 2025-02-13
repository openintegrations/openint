import {Elysia} from 'elysia'

export const app = new Elysia().get('/health2', () => ({status: 'ok'}))

async function main() {
  const res = await app.handle(new Request('https://localhost/health2'))
  console.log(await res.json())
}
void main()
