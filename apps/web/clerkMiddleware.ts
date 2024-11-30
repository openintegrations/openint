import {clerkMiddleware} from '@clerk/nextjs/server'
import {NextRequest, NextResponse} from 'next/server'

export function withClerkMiddleware(
  handler: (req: NextRequest, res: NextResponse) => void,
) {
  return async (req: NextRequest, res: NextResponse) => {
    console.log('withClerkMiddleware', req.nextUrl.pathname)
    // Apply clerkMiddleware for specific routes
    if (
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/api')
    ) {
      console.log('Applying Clerk middleware')

      // Mocking a NextFetchEvent
      const fetchEvent = {
        request: req,
        respondWith: (response: Promise<Response>) => {
          // Mock implementation of respondWith
          response.then((res) => console.log('Response:', res))
        },
        passThroughOnException: () => {
          // Mock implementation of passThroughOnException
          console.log('Pass through on exception')
        },
        waitUntil: (promise: Promise<any>) => {
          // Mock implementation of waitUntil
          promise.catch((err) => console.error('Error in waitUntil:', err))
        },
        // Add other properties if needed
      }

      await clerkMiddleware()(req, fetchEvent as any)
    }

    // Call the original handler
    return handler(req, res)
  }
}
