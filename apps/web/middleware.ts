import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

export const config = {
  matcher: [
    '/console/:path*',
    // for dev purposes we want to be able to use connect as the console user
    '/connect/:path*',
    // Make it easier to test the api
    '/api/:path*',

  ],
}
