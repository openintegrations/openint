import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

export const config = {
  matcher: [
    // This it the primary route we want to protect with clerk
    '/console/:path*',
    // for dev purposes we want to be able to use connect as the console user
    '/connect/:path*',
    // Make it easier to test the api
    '/api/:path*',
    // Allow access to the root page for dev purposes
    '/',
  ],
}
