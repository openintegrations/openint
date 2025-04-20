import type {MiddlewareConfig, NextMiddleware} from 'next/server'

import {NextResponse} from 'next/server'
import {clerkMiddleware} from '@openint/console-auth/server'
import {env} from '@openint/env'

const clerkMiddlewareFn = clerkMiddleware()

export const middleware: NextMiddleware = (req, ev) => {
  // console.log('middleware', req.nextUrl)
  // bypass clerk for connect page in production
  if (env.VERCEL_ENV === 'production') {
    if (
      req.nextUrl.pathname.startsWith('/connect') ||
      req.nextUrl.host === 'connect.openint.dev'
    ) {
      return NextResponse.next()
    }
  }

  return clerkMiddlewareFn(req, ev)
}

export const config = {
  // matcher has to be a constant without any variables or even functions like filter...
  matcher: [
    // This it the primary route we want to protect with clerk
    '/console/:path*',
    {
      has: [{type: 'host', value: 'console.openint.dev'}],
      source: '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt).*)',
    },
    // we need this for authenticated api requests using cookie
    '/api/:path*',
    {
      has: [{type: 'host', value: 'api.openint.dev'}],
      source: '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt).*)',
    },
    // Dev only
    '/connect/:path*',
    {
      has: [{type: 'host', value: 'connect.openint.dev'}],
      source: '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt).*)',
    },
    // root route
    '/',
    // Catch all route
    // '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
} satisfies MiddlewareConfig
