import {z} from 'zod'
import {publicProcedure, router} from '../trpc/_base'

export const generalRouter = router({
  health: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        description: 'Check if the API is operational',
        summary: 'Health Check',
        // Normally these would be disabled as they are internal endpoints but
        // since we use them for tests of oas generation we leave them on
        // and then hardcode remove it form docs in generateDocsOas.bin.cjs
        // enabled: false,
      },
    })
    .input(z.void())
    .output(z.object({ok: z.boolean()}))
    .query(() => ({ok: true})),

  healthEcho: publicProcedure
    // Normally these would be disabled as they are internal endpoints but
    // since we use them for tests of oas generation we leave them on
    // and then hardcode remove it form docs in generateDocsOas.bin.cjs
    // enabled: false,
    .meta({openapi: {method: 'POST', path: '/health'}})
    .input(z.object({}).passthrough())
    .output(z.object({}).passthrough())
    .mutation(({input}) => ({input})),

  viewer: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/viewer',
        description: 'Get information about the current authenticated user',
        summary: 'Get Current User',
        enabled: false,
      },
    })
    .input(z.void())
    // note: not returning zViewer as it seems to be tripping up the stainless sdk generation
    .output(z.object({role: z.enum(['customer', 'org', 'anon', 'user'])}))
    // @ts-expect-error
    .query(({ctx}) => {
      return {role: ctx.viewer.role}
    }),
})
