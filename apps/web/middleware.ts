import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

// Only want clerk to deal with dashboard routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/v0/:path*',
    '/console/:path*',
    // FOr now, used for debugging
    '/connect-v1/:path*',
  ],
}
