import {clerkMiddleware} from '@clerk/nextjs/server'

// Disable redirects
export default clerkMiddleware()

// Only want clerk to deal with dashboard routes
const config = {
  matcher: ['/console/:path*'],
}

// normally we would import isProduction from env, but this is not allowed in Edge Runtime where middleware runs
// because of Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime
const isProduction =
  process.env['NODE_ENV'] === 'production' ||
  process.env['VERCEL_ENV'] === 'production'

if (!isProduction) {
  // for dev purposes we want to be able to use connect as the console user
  config.matcher.push('/connect/:path*')
}

export {config}
