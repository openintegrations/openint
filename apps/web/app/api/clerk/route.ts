import {clerkClient} from '@clerk/nextjs/server'
import {env} from '@openint/app-config/env'

export async function GET(request: Request) {
  if (!env.STABLY_CLERK_TESTING_TOKEN_SECRET) {
    console.warn(
      'STABLY_CLERK_TESTING_TOKEN_SECRET is not set returning 404 on /api/clerk',
    )
    return new Response(null, {status: 404})
  }

  const url = new URL(request.url)
  const token = url.searchParams.get('t')

  if (token !== env.STABLY_CLERK_TESTING_TOKEN_SECRET) {
    return new Response(null, {status: 401})
  }

  const clerk = clerkClient()
  const testToken = await clerk.testingTokens.createTestingToken()
  if (!testToken || !testToken.token) {
    return new Response(null, {status: 500})
  }
  return Response.json({testToken: testToken.token})
}
