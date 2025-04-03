import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

export const config = {
  // for dev purposes we want to be able to use connect as the console user
  matcher: ['/console/:path*', '/connect/:path*'],
}
