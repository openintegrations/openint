import type {Env} from '@openint/env'

import * as Sentry from '@sentry/nextjs'
import {posthog} from 'posthog-js'
import {getSentryEnvironment} from '@openint/env'
import {z} from '@openint/util/zod-utils'

// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const env = process.env as unknown as Env

const SENTRY_DSN = env['NEXT_PUBLIC_SENTRY_DSN']

const NODE_ENV = env['NEXT_PUBLIC_NODE_ENV']

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
    //   env['NEXT_PUBLIC_SENTRY_ORG'] &&
    //     new posthog.SentryIntegration(
    //       posthog,
    //       // We really need a better way to access env var (and zod validation in general)
    //       // that is actually readable...
    //       z.string().parse(env['NEXT_PUBLIC_SENTRY_ORG']),
    //       z.number().parse(Number.parseInt(SENTRY_DSN?.split('/').pop() ?? '')),
    //     ),
    // ]),
    environment: getSentryEnvironment(),
  })
  Sentry.setTags({
    'vercel.env': env['NEXT_PUBLIC_VERCEL_ENV'],
    'git.branch': env['NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF'],
  })

  // Workaround, @see https://github.com/PostHog/posthog-js/issues/1205
  const posthogSentry = env['NEXT_PUBLIC_SENTRY_ORG']
    ? new posthog.SentryIntegration(
        posthog,
        // We really need a better way to access env var (and zod validation in general)
        // that is actually readable...
        z.string().parse(env['NEXT_PUBLIC_SENTRY_ORG']),
        z.number().parse(Number.parseInt(SENTRY_DSN?.split('/').pop() ?? '')),
      )
    : undefined
  posthogSentry?.setupOnce(Sentry.addEventProcessor, () => {})

  console.log('[sentry.client] initialized')
}
