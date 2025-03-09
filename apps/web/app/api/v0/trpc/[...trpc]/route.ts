import {createAppTrpcHandler} from '@openint/api'

/** https://vercel.com/docs/functions/runtimes#max-duration */
export const maxDuration = 300

const handler = createAppTrpcHandler({endpoint: '/api/v0/trpc'})

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
