import {initTRPC} from '@trpc/server'
import type {Viewer} from '@openint/cdk'

export interface RouterContext {
  viewer: Viewer
}

const t = initTRPC.context<RouterContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const appRouter = router({
  // getOpenapiDocument: publicProcedure
  //   .meta({openapi: {method: 'GET', path: '/openapi.json', tags: ['Internal']}})
  //   .input(t.void())
  //   .output(t.unknown())
  //   .query((): unknown => getOpenAPISpec()),
  health: publicProcedure.query(() => 'ok'),
})

export type AppRouter = typeof appRouter

async function main() {
  const res = await appRouter.createCaller({viewer: {role: 'system'}}).health()
  console.log(res)
}
void main()
