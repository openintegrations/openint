import {clerkMiddleware} from '@openint/console-auth/server'

// Disable redirects
export default clerkMiddleware()

export const config = {
  matcher: [

    // // This it the primary route we want to protect with clerk
    // '/console/:path*',
    // // for dev purposes we want to be able to use connect as the console user
    // '/connect/:path*',
    // // Make it easier to test the api
    // '/api/:path*',
    // // Allow access to the root page for dev purposes
    // '/',
    // Need to match all routes due to the way we handle subdomain deployments
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
