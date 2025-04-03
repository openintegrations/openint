import {clerkMiddleware} from '@clerk/nextjs/server'
import {isProduction} from '@openint/env'

// Disable redirects
export default clerkMiddleware()

// Only want clerk to deal with dashboard routes
const config = {
  matcher: ['/console/:path*'],
}

if (!isProduction) {
  // for dev purposes we want to be able to use connect as the console user
  config.matcher.push('/connect/:path*')
}

export {config}
