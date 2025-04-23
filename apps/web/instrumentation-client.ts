import type {Env} from '@openint/env'

import * as Sentry from '@sentry/nextjs'
import {posthog} from 'posthog-js'
import {getSentryEnvironment} from '@openint/env'

// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const env = process.env as unknown as Env

const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN
const nodeEnv = env.NEXT_PUBLIC_NODE_ENV
const posthogWriteKey = env.NEXT_PUBLIC_POSTHOG_WRITEKEY

if (!sentryDsn) {
  console.warn('SENTRY_DSN not set, skipping sentry initialization')
} else {
  Sentry.init({
    enabled: nodeEnv === 'production' || window.location.href.includes('debug'),
    dsn: sentryDsn,
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
    //   env.NEXT_PUBLIC_SENTRY_ORG &&
    //     new posthog.SentryIntegration(
    //       posthog,
    //       // We really need a better way to access env var (and zod validation in general)
    //       // that is actually readable...
    //       z.string().parse(env.NEXT_PUBLIC_SENTRY_ORG),
    //       z.number().parse(Number.parseInt(SENTRY_DSN?.split('/').pop() ?? '')),
    //     ),
    // ]),
    environment: getSentryEnvironment(),
  })
  Sentry.setTags({
    'vercel.env': env.NEXT_PUBLIC_VERCEL_ENV,
    'git.branch': env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
  })

  console.log('[sentry.client] initialized')
}

if (!posthogWriteKey) {
  console.warn('POSTHOG_WRITEKEY not set, skipping posthog initialization')
} else {
  posthog.init(posthogWriteKey, {
    api_host: '/_posthog',
    autocapture: true,
    capture_pageview: false,
    loaded: () => {
      posthog.register({environment: getSentryEnvironment()})
    },
  })
  console.log('[posthog.client] initialized')

  // Disabling sentry posthog for now...
  // if (!env.NEXT_PUBLIC_SENTRY_ORG) {
  //   console.warn('SENTRY_ORG not set, skipping posthog-sentry integration')
  // } else {
  //   // Workaround, @see https://github.com/PostHog/posthog-js/issues/1205
  //   const posthogSentry = new posthog.SentryIntegration(
  //     posthog,
  //     // We really need a better way to access env var (and zod validation in general)
  //     // that is actually readable...
  //     z.string().parse(env.NEXT_PUBLIC_SENTRY_ORG),
  //     z.number().parse(Number.parseInt(sentryDsn?.split('/').pop() ?? '')),
  //   )
  //   posthogSentry.setupOnce(Sentry.addEventProcessor, () => {})
  // }
}

// Can't find docs for this but got a log about this in terminal
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
