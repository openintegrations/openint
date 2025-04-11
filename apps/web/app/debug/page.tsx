import type {PageProps} from '@/lib-common/next-utils'
import {
  errorFormatter,
  fetchRequestHandler,
  initTRPC,
  onError,
  TRPCError,
} from '@openint/api-v1/trpc/error-handling'
import {createTRPCClient, httpLink} from '@openint/ui-v1/trpc'
import {z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'

const trpc = initTRPC.create({errorFormatter})

const router = trpc.router({
  errorTest: trpc.procedure
    .meta({openapi: {method: 'GET', path: '/error-test'}})
    .input(z.object({code: z.string()}))
    .output(z.never())
    .query(({input}) => {
      switch (input.code) {
        case 'NOT_FOUND':
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Resource not found',
          })
        case 'BAD_REQUEST':
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid request parameters',
          })
        case 'UNAUTHORIZED':
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Missing or invalid authentication',
          })
        default:
          throw new Error('Unexpected error code')
      }
    }),
  err500: trpc.procedure
    .meta({openapi: {method: 'GET', path: '/err500'}})
    .input(z.object({}))
    .output(z.never())
    .query(() => {
      throw new Error('custom error')
    }),
  errOutputValidation: trpc.procedure
    .meta({openapi: {method: 'GET', path: '/err-output-validation'}})
    .input(z.object({}))
    .output(z.object({key: z.string()}))
    .query(() => {
      return {badKey: 'badValue'} as any
    }),
})

const handleTrpcRequest = (req: Request) =>
  fetchRequestHandler({router, endpoint: '/', req, onError})

// Object.defineProperty(TRPCError.prototype, 'message', {
//   get() {
//     const msg = orgMessage.call(this)
//     // We do this to prevent data from being too long to display
//     const issues = JSON.parse(msg)
//     // const jsonSchema = zodToOas31Schema(this.schema)
//     // This can sometimes be too long to display, so never mind for now
//     const schema = this.schema as Z.ZodType
//     const openapi = schema._def.zodOpenApi?.openapi
//     return JSON.stringify(
//       {issues, data: this.data, openapi, description: schema.description},
//       null,
//       2,
//     )
//   },
//   configurable: true,
//   enumerable: true,
// })

export default async function DebugPage(pageProps: PageProps) {
  const {searchParams} = await parsePageProps(pageProps, {
    searchParams: z.object({
      type: z.enum(['TRPCError', 'TRPCClientError', 'err500', 'UNAUTHORIZED']),
    }),
  })

  const client = createTRPCClient<typeof router>({
    links: [
      httpLink({
        url: 'http://localhost/',
        fetch: (input, init) => handleTrpcRequest(new Request(input, init)),
      }),
    ],
  })

  const caller = router.createCaller({}, {onError})

  if (searchParams.type === 'TRPCError') {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'This is a test TRPC Server Error',
    })
  } else if (searchParams.type === 'TRPCClientError') {
    await client.errorTest.query({code: 'BAD_REQUEST'})
  } else if (searchParams.type === 'err500') {
    await caller.err500({})
  } else if (searchParams.type === 'UNAUTHORIZED') {
    await caller.errorTest({code: 'UNAUTHORIZED'})
  }
}
