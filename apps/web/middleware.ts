import type {NextMiddleware} from 'next/server'

import {NextResponse} from 'next/server'
import {clerkMiddleware} from '@openint/console-auth/server'
import {env} from '@openint/env'

const clerkMiddlewareFn = clerkMiddleware()

export const middleware: NextMiddleware = (req, ev) => {
  // console.log('middleware', req.nextUrl)
  // bypass clerk for connect page in production
  if (
    req.nextUrl.pathname.startsWith('/connect') &&
    env.VERCEL_ENV === 'production'
  ) {
    return NextResponse.next()
  }

  return clerkMiddlewareFn(req, ev)
}

export const config = {
  // matcher has to be a constant without any variables or even functions like filter...
  matcher: [
    // This it the primary route we want to protect with clerk
    '/console/:path*',
    // we need this for authenticated api requests using cookie
    '/api/:path*',
    // Dev only
    '/connect/:path*',
    // Catch all route
    // '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
