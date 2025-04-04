import {createTRPCClient, httpLink, TRPCClientError} from '@trpc/client'
import {initTRPC, TRPCError} from '@trpc/server'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {TRPC_ERROR_CODES_BY_KEY} from '@trpc/server/rpc'
import {createOpenApiFetchHandler, type OpenApiMeta} from 'trpc-to-openapi'
import {z, ZodErrorWithData} from '@openint/util/zod-utils'
import {errorFormatter, onError, parseAPIError} from './error-handling'

const trpc = initTRPC.meta<OpenApiMeta>().create({errorFormatter})

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

// TODO: Refactor test into describe.each for each calling pattern to guarantee
// expectation checking

describe('OpenAPI endpoints', () => {
  const handleOasRequest = (req: Request) =>
    createOpenApiFetchHandler({endpoint: '/', req, router, onError})

  test('handle not found', async () => {
    const res = await handleOasRequest(
      new Request('http://localhost:3000/error-test?code=NOT_FOUND'),
    )
    expect(res.status).toBe(404)

    const json = await res.json()
    expect(json).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      data: {
        code: 'NOT_FOUND',
        httpStatus: 404,
        path: 'errorTest',
        stack: expect.any(String),
        // TODO: Test that stack does not show during prod
      },
    })
    expect(parseAPIError(json)).toEqual(json)
  })

  test('handle bad request', async () => {
    const res = await handleOasRequest(
      new Request('http://localhost:3000/error-test?code=BAD_REQUEST'),
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Invalid request parameters',
      data: {
        code: 'BAD_REQUEST',
        httpStatus: 400,
        path: 'errorTest',
        stack: expect.any(String),
      },
    })
    expect(parseAPIError(json)).toEqual(json)
  })

  test('handle 500', async () => {
    const res = await handleOasRequest(
      new Request('http://localhost:3000/err500'),
    )
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'custom error',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        path: 'err500',
        stack: expect.any(String),
      },
    })
    expect(parseAPIError(json)).toEqual(json)
  })

  test('input validation failure', async () => {
    const res = await handleOasRequest(
      new Request('http://localhost:3000/error-test'),
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Input validation failed',
      data: {
        code: 'BAD_REQUEST',
        httpStatus: 400,
        path: 'errorTest',
        stack: expect.any(String),
      },
      issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['code'],
          message: 'Required',
        },
      ],
    })
    expect(parseAPIError(json)).toEqual(json)
  })

  test('handle output validation failure', async () => {
    const res = await handleOasRequest(
      new Request('http://localhost:3000/err-output-validation'),
    )

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Output validation failed',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        path: 'errOutputValidation',
        stack: expect.any(String),
      },
      output_issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['key'],
          message: 'Required',
        },
      ],
    })
    expect(parseAPIError(json)).toEqual(json)
  })
})

describe('TRPC over http', () => {
  const handleTrpcRequest = (req: Request) =>
    fetchRequestHandler({router, endpoint: '/', req, onError})

  const client = createTRPCClient<typeof router>({
    links: [
      httpLink({
        url: 'http://localhost/',
        fetch: (input, init) => handleTrpcRequest(new Request(input, init)),
      }),
    ],
  })

  test('handle not found', async () => {
    const err: TRPCClientError<typeof router> = await client.errorTest
      .query({code: 'NOT_FOUND'})
      .catch((e) => e)

    expect(err).toBeInstanceOf(TRPCClientError)

    expect(err.message).toEqual('Resource not found')
    expect(err.data).toMatchObject({
      code: 'NOT_FOUND',
      httpStatus: 404,
      path: 'errorTest',
      stack: expect.any(String),
    })
    expect(parseAPIError(err)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      data: {
        code: 'NOT_FOUND',
        httpStatus: 404,
        path: 'errorTest',
        stack: expect.any(String),
      },
    })
  })

  test('handle 500 error', async () => {
    const err: TRPCClientError<typeof router> = await client.err500
      .query({})
      .catch((e) => e)

    expect(err).toBeInstanceOf(TRPCClientError)
    expect(err.message).toEqual('custom error')
    expect(err.data).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      httpStatus: 500,
      path: 'err500',
      stack: expect.any(String),
    })
    expect(parseAPIError(err)).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'custom error',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        path: 'err500',
        stack: expect.any(String),
      },
    })
  })

  test('handle input validation failure (+ check meta.responseJSON parity)', async () => {
    const err: TRPCClientError<typeof router> = await client.errorTest
      .query({invalid: 'input'} as never)
      .catch((e) => e)

    expect(err).toBeInstanceOf(TRPCClientError)
    expect(err.message).toEqual('Input validation failed')

    expect(err.data).toMatchObject({
      code: 'BAD_REQUEST',
      httpStatus: 400,
      path: 'errorTest',
      stack: expect.any(String),
    })
    expect(parseAPIError(err)).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Input validation failed',
      data: {
        code: 'BAD_REQUEST',
        httpStatus: 400,
        path: 'errorTest',
        stack: expect.any(String),
      },
      issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['code'],
          message: 'Required',
        },
      ],
    })

    const json = err.meta?.['responseJSON']

    expect(json).toEqual({
      error: {
        message: 'Input validation failed',
        code: TRPC_ERROR_CODES_BY_KEY.BAD_REQUEST,
        data: {
          code: 'BAD_REQUEST',
          httpStatus: 400,
          path: 'errorTest',
          stack: expect.any(String),
        },
        issues: [
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['code'],
            message: 'Required',
          },
        ],
      },
    })

    // Verify that meta.responseJSON is the same as the raw response JSON
    const res = await handleTrpcRequest(
      new Request(
        `http://localhost/errorTest?input=${JSON.stringify({invalid: 'input'})}`,
      ),
    )
    expect(res.status).toBe(400)
    const removeStack = (obj: any) => {
      delete obj.error.data.stack
      return obj
    }
    expect(removeStack(await res.json())).toEqual(
      removeStack(err.meta?.['responseJSON']),
    )
    // console.log(err.meta?.['responseJSON'])
  })

  test('handle output validation failure', async () => {
    const err: TRPCClientError<typeof router> = await client.errOutputValidation
      .query({})
      .catch((e) => e)

    expect(err).toBeInstanceOf(TRPCClientError)
    expect(err.message).toEqual('Output validation failed')
    expect(err.data).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      httpStatus: 500,
      path: 'errOutputValidation',
      stack: expect.any(String),
    })
    expect(parseAPIError(err)).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Output validation failed',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        path: 'errOutputValidation',
        stack: expect.any(String),
      },
      output_issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ],
    })
  })
})

describe('TRPC caller', () => {
  const caller = router.createCaller({}, {onError})

  test('handle not found', async () => {
    const err = await caller.errorTest({code: 'NOT_FOUND'}).catch((e) => e)
    expect(err).toBeInstanceOf(TRPCError)
    expect(err.code).toEqual('NOT_FOUND')
    expect(err.message).toEqual('Resource not found')
    expect(err.stack).toEqual(expect.any(String))

    expect(parseAPIError(err)).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      data: {
        code: 'NOT_FOUND',
        httpStatus: 404,
        path: 'errorTest',
        stack: expect.any(String),
      },
    })
  })

  test('handle 500 error', async () => {
    const err = await caller.err500({}).catch((e) => e)
    expect(err).toBeInstanceOf(TRPCError)
    expect(err.code).toEqual('INTERNAL_SERVER_ERROR')
    expect(err.message).toEqual('custom error')
    expect(err.stack).toEqual(expect.any(String))

    expect(parseAPIError(err)).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'custom error',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    })
  })

  test('handle input validation failure', async () => {
    const err: TRPCError = await caller
      .errorTest({invalid: 'input'} as never)
      .catch((e) => e)
    expect(err).toBeInstanceOf(TRPCError)
    expect(err.code).toEqual('BAD_REQUEST')
    expect(err.message).toEqual('Input validation failed')
    expect(err.stack).toEqual(expect.any(String))
    const cause = err.cause as ZodError
    expect(cause).toBeInstanceOf(z.ZodError)

    expect(cause.errors).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['code'],
        message: 'Required',
      },
    ])
    expect(cause.message).toEqual(JSON.stringify(cause.errors, null, 2))
    expect(parseAPIError(err)).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Input validation failed',
      data: {
        code: 'BAD_REQUEST',
      },
      issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ],
    })
  })

  test('handle output validation failure', async () => {
    const err: TRPCError = await caller.errOutputValidation({}).catch((e) => e)
    expect(err).toBeInstanceOf(TRPCError)
    expect(err.code).toEqual('INTERNAL_SERVER_ERROR')
    expect(err.message).toEqual('Output validation failed')
    expect(err.stack).toEqual(expect.any(String))
    // expect(err.cause).toBeInstanceOf(TRPCError)
    const cause = err.cause as ZodErrorWithData
    expect(cause).toBeInstanceOf(z.ZodError)
    expect(cause.errors).toEqual([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['key'],
        message: 'Required',
      },
    ])
    expect(cause.message).toEqual(JSON.stringify(cause.errors, null, 2))

    expect(parseAPIError(err)).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Output validation failed',
      data: {
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        path: 'errOutputValidation',
        stack: expect.any(String),
      },
      output_issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ],
    })
  })
})
