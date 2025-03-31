import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

// Only want clerk to deal with dashboard routes
export const config = {
  matcher: [
    '/console/:path*',
    // For now, used for debugging
    '/connect/:path*',
  ],
}
