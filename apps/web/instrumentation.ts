import type {Instrumentation} from 'next'
import type {InstrumentationModule} from 'next/dist/server/instrumentation/types'
import type {Env} from '@openint/env'

import * as Sentry from '@sentry/nextjs'
import {notifySlackError} from '@openint/api-v1/lib/slack'

/** Type only import to avoid any issues during parsing messing up with instrumentation */
const env = process.env as unknown as Env

// https://nextjs.org/docs/14/app/building-your-application/optimizing/instrumentation

export const register: InstrumentationModule['register'] = () => {
  const SENTRY_DSN = env['SENTRY_DSN'] || env['NEXT_PUBLIC_SENTRY_DSN']

  const NODE_ENV = env.NODE_ENV || env['NEXT_PUBLIC_NODE_ENV']

  if (!SENTRY_DSN) {
    console.warn('SENTRY_DSN not set, skipping sentry initialization')
  } else {
    Sentry.init({
      enabled: NODE_ENV === 'production',
      dsn: SENTRY_DSN,
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1.0,
      // ...
      // Note: if you want to override the automatic release value, do not set a
      // `release` value here - use the environment variable `SENTRY_RELEASE`, so
      // that it will also get attached to your source maps
    })
    Sentry.setTags({
      'vercel.env': env['VERCEL_ENV'] || env['NEXT_PUBLIC_VERCEL_ENV'],
      'git.branch':
        env['VERCEL_GIT_COMMIT_REF'] ||
        env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF'],
    })
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
