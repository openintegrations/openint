import type {Instrumentation} from 'next'
import type {Env} from '@openint/env'

import * as Sentry from '@sentry/nextjs'
import {notifySlackError} from '@openint/api-v1/lib/slack'

/** Type only import to avoid any issues during parsing messing up with instrumentation */
const env = process.env as unknown as Env

// https://nextjs.org/docs/14/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env['NEXT_RUNTIME'] === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#parameters
 */
export const onRequestError: Instrumentation.onRequestError = async (
  _err,
  req,
  ctx,
) => {
  // see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#parameters
  const err = _err as {digest: string} & Error
  console.log('onRequestError', err, req, ctx)
  Sentry.captureRequestError(err, req, ctx)

  await notifySlackError('Next.js crashed', {
    err: {message: String(err), digest: err.digest},
    req: {
      method: req.method,
      path: req.path,
      host: req.headers['host'],
    },
    ctx,
  })
}
