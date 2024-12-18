import {clerkMiddleware, createClerkClient} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware({
  publishableKey: process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
  domain: process.env['NEXT_PUBLIC_SERVER_URL'],
  apiClient: createClerkClient({secretKey: process.env['CLERK_SECRET_KEY']}),
})

// Only want clerk to deal with dashboard routes
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
