import type {MiddlewareConfig, NextMiddleware} from 'next/server'

import {NextResponse} from 'next/server'
import {clerkMiddleware} from '@openint/console-auth/server'
import {env} from '@openint/env'

const clerkMiddlewareFn = clerkMiddleware()

export const middleware: NextMiddleware = (req, ev) => {
  if (env.VERCEL_ENV === 'production') {
    if (
      req.nextUrl.pathname.startsWith('/connect') ||
      req.nextUrl.host === 'connect.openint.dev'
    ) {
      return NextResponse.next()
    }
  }

  // We allow for clerk on all non-special routes except for connect in production
  return clerkMiddlewareFn(req, ev)
}

export const config = {
  // matcher has to be a constant without any variables or even functions like filter...
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
} satisfies MiddlewareConfig
