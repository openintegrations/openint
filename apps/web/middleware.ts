import {clerkMiddleware, createClerkClient} from '@clerk/nextjs/server'

const client = createClerkClient({secretKey: process.env['CLERK_SECRET_KEY']})

function getRuntimeClerkDomain() {
  if (process.env['NEXT_PUBLIC_RUNTIME_ENV'] === 'edge') {
    return process.env['NEXT_PUBLIC_SERVER_URL']
  }
  return undefined
}
// Disable redirects
export default clerkMiddleware({
  publishableKey: process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
  domain: getRuntimeClerkDomain(),
  apiClient: client,
})

// Only want clerk to deal with dashboard routes
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
