import type {RouterContextOnError} from '@openint/api-v1/trpc/error-handling'
import type {PageProps} from '@/lib-common/next-utils'

import {createTRPCClient, httpLink} from '@trpc/client'
import {
  errorFormatter,
  fetchRequestHandler,
  initTRPC,
  onError,
  TRPCError,
} from '@openint/api-v1/trpc/error-handling'
import {z} from '@openint/util/zod-utils'
import {parsePageProps} from '@/lib-common/next-utils'

const trpc = initTRPC.context<RouterContextOnError>().create({errorFormatter})

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

// modify TRPCError in case of direct callling
const caller = router.createCaller({prefixCodeToErrorMessage: true}, {onError})

// handle TRPCError in case of of calling via client. This is probably not relevant
// as we never use this pattern in server components directly
const handleTrpcRequest = (req: Request) =>
  fetchRequestHandler({
    router,
    endpoint: '/',
    req,
    onError,
    createContext: () => ({prefixCodeToErrorMessage: true}),
  })

export default async function DebugErrorPage(pageProps: PageProps) {
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

  if (searchParams.type === 'TRPCError') {
    // if we throw a TRPCError directly, it will not go through onError
    // and therefore code will not be prefixed and this information will be lost
    // by the time we get to the client side
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
