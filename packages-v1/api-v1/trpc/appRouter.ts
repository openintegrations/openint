import {generateOpenApiDocument} from 'trpc-to-openapi'
import {z} from 'zod'
import {publicProcedure, router} from './trpc'

export const appRouter = router({
  // getOpenapiDocument: publicProcedure
  //   .meta({openapi: {method: 'GET', path: '/openapi.json', tags: ['Internal']}})
  //   .input(t.void())
  //   .output(t.unknown())
  //   .query((): unknown => getOpenAPISpec()),
  health: publicProcedure
    .meta({openapi: {method: 'GET', path: '/health'}})
    .input(z.void())
    .output(z.string())
    .query(() => 'ok'),
})

export type AppRouter = typeof appRouter

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'OpenInt',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000', // Replace with proper url
})
