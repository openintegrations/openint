import {createAppTrpcHandler} from '@openint/api'

export const runtime = 'edge'

// Functions using the Edge runtime do not have a maximum duration. They must begin sending a response within 25 seconds and can continue streaming a response beyond that time.
/** https://vercel.com/docs/functions/runtimes#max-duration */
// export const maxDuration = 300

const handler = createAppTrpcHandler({endpoint: '/api/trpc'})

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}

// TODO: Test webhook handling still works
// TODO: Test TRPC error code to http error code mapping still works
