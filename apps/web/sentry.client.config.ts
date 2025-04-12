// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'
import {posthog} from 'posthog-js'
import {z} from '@openint/util/zod-utils'

const SENTRY_DSN =
  process.env['SENTRY_DSN'] || process.env['NEXT_PUBLIC_SENTRY_DSN']

const NODE_ENV = process.env.NODE_ENV || process.env['NEXT_PUBLIC_NODE_ENV']

;(globalThis as any).NODE_ENV = NODE_ENV

export function getSentryEnvironment() {
  const serverUrl =
    process.env['NEXT_PUBLIC_SERVER_URL'] || process.env['VERCEL_URL']
  const vercelBranchUrl = process.env['VERCEL_BRANCH_URL']
  const vercelBranchIsMainOrProduction =
    vercelBranchUrl?.includes('main') || vercelBranchUrl?.includes('production')

  if (!serverUrl || !vercelBranchIsMainOrProduction) {
    return undefined
  }
  return serverUrl.split('://')[1]
}

if (!SENTRY_DSN) {
  console.warn('SENTRY_DSN not set, skipping sentry initialization')
} else {
  Sentry.init({
    enabled: NODE_ENV === 'production',
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1.0,
    integrations: [Sentry.captureConsoleIntegration()],
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
    // integrations: compact([
    //   // @see https://share.cleanshot.com/zz9KPwZh
    //   // https://share.cleanshot.com/zz9KPwZh
    //   process.env['NEXT_PUBLIC_SENTRY_ORG'] &&
    //     new posthog.SentryIntegration(
    //       posthog,
    //       // We really need a better way to access env var (and zod validation in general)
    //       // that is actually readable...
    //       z.string().parse(process.env['NEXT_PUBLIC_SENTRY_ORG']),
    //       z.number().parse(Number.parseInt(SENTRY_DSN?.split('/').pop() ?? '')),
    //     ),
    // ]),
    environment: getSentryEnvironment(),
  })
  Sentry.setTags({
    'vercel.env':
      process.env['VERCEL_ENV'] || process.env['NEXT_PUBLIC_VERCEL_ENV'],
    'git.branch':
      process.env['VERCEL_GIT_COMMIT_REF'] ||
      process.env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF'],
  })

  // Workaround, @see https://github.com/PostHog/posthog-js/issues/1205
  const posthogSentry = process.env['NEXT_PUBLIC_SENTRY_ORG']
    ? new posthog.SentryIntegration(
        posthog,
        // We really need a better way to access env var (and zod validation in general)
        // that is actually readable...
        z.string().parse(process.env['NEXT_PUBLIC_SENTRY_ORG']),
        z.number().parse(Number.parseInt(SENTRY_DSN?.split('/').pop() ?? '')),
      )
    : undefined
  posthogSentry?.setupOnce(Sentry.addEventProcessor, () => {})

  console.log('[sentry.client] initialized')
}

export {Sentry}
