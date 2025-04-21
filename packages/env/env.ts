import {createEnv} from '@t3-oss/env-nextjs'
import {makeUlid} from '@openint/util/id-utils'
import {proxyReadOnly, proxyRequired} from '@openint/util/proxy-utils'
import {z} from '@openint/util/zod-utils'

// TODO: Remove the dep on @t3-oss as it causes all sorts of issues with zod

export const envConfig = {
  server: {
    // MARK: - Not validated, may not be used...
    // Core env vars
    DATABASE_URL: z
      .string()
      .default('postgres://postgres:password@db.localtest.me:5432/postgres'),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    /** placeholder here for testing purposes. This needs to be set in order for tokens to actually be valid across server restarts */
    JWT_SECRET: z.string().default(`placeholder_jwt_secret_${makeUlid()}`),

    CLERK_SECRET_KEY: z.string().optional(),

    // Required for worker to work when deployed
    INNGEST_SIGNING_KEY: z.string().optional(),
    INNGEST_EVENT_KEY: z.string().optional(),

    // Optional
    SENTRY_CRON_MONITOR_URL: z.string().optional(),

    // Turn on debug output, including drizzle. Should be a boolean tho
    DEBUG: z.string().optional(),

    // Variables set by Vercel when deployed
    VERCEL_URL: z.string().optional(),
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    INTEGRATION_TEST_SECRET: z.string().optional(),

    // Secret for cron jobs
    CRON_SECRET: z.string().optional(),
    REFRESH_CONNECTION_CONCURRENCY: z.coerce.number().optional().default(3),
    PORT: z.string().optional(),
    NODE_ENV: z.enum(['production', 'development', 'test']).optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
    NEXT_PUBLIC_SERVER_URL: z.string().optional(),
    NEXT_PUBLIC_API_URL: z
      .string()
      .optional()
      .describe(
        'In case API is deployed separately from the main server or there is a reverse proxy in front',
      ),
    NEXT_PUBLIC_CONSOLE_URL: z
      .string()
      .optional()
      .describe(
        'In case console is deployed separately from the main server or there is a reverse proxy in front',
      ),
    NEXT_PUBLIC_CONNECT_URL: z
      .string()
      .optional()
      .describe(
        'In case connect is deployed separately from the main server or there is a reverse proxy in front',
      ),
    // Where the app is running. Only used by getServerUrl at the moment
    NEXT_PUBLIC_PORT: z.string().optional(),

    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_ORG: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_WRITEKEY: z.string().optional(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
    /** One url to rule them all */
    NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY: z
      .string()
      .default('https://app.openint.dev/connect/callback'),
    // TODO: Reset to this once we have fully update the redirect URLs and sunset v0
    // .default('https://connect.openint.dev/callback'),

    // Useful later for when we switch to asymmetric jwt rather than symmetric ones
    // JWT_PRIVATE_KEY: z.string().optional(),
    // NEXT_PUBLIC_JWT_PUBLIC_KEY: z.string().optional(),
  },
  runtimeEnv: overrideFromLocalStorage({
    NEXT_PUBLIC_VERCEL_ENV:
      process.env['NEXT_PUBLIC_VERCEL_ENV'] || process.env['VERCEL_ENV'], // Should be unnecessary but just in case
    NEXT_PUBLIC_SERVER_URL: process.env['NEXT_PUBLIC_SERVER_URL'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
    NEXT_PUBLIC_CONSOLE_URL: process.env['NEXT_PUBLIC_CONSOLE_URL'],
    NEXT_PUBLIC_CONNECT_URL: process.env['NEXT_PUBLIC_CONNECT_URL'],
    NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],
    NEXT_PUBLIC_SENTRY_ORG: process.env['NEXT_PUBLIC_SENTRY_ORG'],
    NEXT_PUBLIC_POSTHOG_WRITEKEY: process.env['NEXT_PUBLIC_POSTHOG_WRITEKEY'],
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'],
    DEBUG: process.env['DEBUG'],
    JWT_SECRET: process.env['JWT_SECRET'],
    CLERK_SECRET_KEY: process.env['CLERK_SECRET_KEY'],
    SENTRY_CRON_MONITOR_URL: process.env['SENTRY_CRON_MONITOR_URL'],
    VERCEL_ENV: process.env['VERCEL_ENV'],
    INNGEST_EVENT_KEY: process.env['INNGEST_EVENT_KEY'],
    INNGEST_SIGNING_KEY: process.env['INNGEST_SIGNING_KEY'],
    NEXT_PUBLIC_PORT: process.env['NEXT_PUBLIC_PORT'],
    DATABASE_URL: process.env['DATABASE_URL'],
    DATABASE_URL_UNPOOLED: process.env['DATABASE_URL_UNPOOLED'],
    VERCEL_URL: process.env['VERCEL_URL'],
    INTEGRATION_TEST_SECRET: process.env['INTEGRATION_TEST_SECRET'],
    PGLITE: process.env['PGLITE'],
    CRON_SECRET: process.env['CRON_SECRET'],
    REFRESH_CONNECTION_CONCURRENCY:
      process.env['REFRESH_CONNECTION_CONCURRENCY'],
    NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY:
      process.env['NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY'],
    // JWT_PRIVATE_KEY: process.env['JWT_PRIVATE_KEY'],
    // NEXT_PUBLIC_JWT_PUBLIC_KEY: process.env['NEXT_PUBLIC_JWT_PUBLIC_KEY'],
    PORT: process.env['PORT'],
    NODE_ENV: process.env['NODE_ENV'],
  }),
} satisfies Parameters<typeof createEnv>[0]

/** Primarily for testing purposes */
export const envMutable = {
  ...createEnv(envConfig),
}

/** Read-only proxy of envMutable */
export const env = proxyReadOnly(envMutable)

/** Proxy env throw on missing values */
export const envRequired = proxyRequired(env, {
  formatError(opts) {
    return new Error(`Missing required env var: ${opts.key} ${opts.reason}`)
  },
})

export const isProduction =
  env['NODE_ENV'] === 'production' || env['VERCEL_ENV'] === 'production'

export type Env = typeof env

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(globalThis as any).env = env

/** Allow NEXT_PUBLIC values to be overwriten from localStorage for debugging purposes */
function overrideFromLocalStorage<T>(runtimeEnv: T) {
  if (typeof window !== 'undefined' && window.localStorage) {
    for (const key in runtimeEnv) {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const value = window.localStorage.getItem(key)
        if (value != null) {
          runtimeEnv[key] = value as T[Extract<keyof T, string>]
          console.warn(`[env] Overriding from localStorage ${key} = ${value}`)
        }
      }
    }
  }
  return runtimeEnv
}

/** For testing */
export function temporarilyModifyEnv(
  override: Partial<typeof envMutable>,
  fn: () => void,
) {
  const originalValues = Object.fromEntries(
    Object.keys(override).map((key) => [
      key,
      envMutable[key as keyof typeof envMutable],
    ]),
  )
  Object.assign(envMutable, override)
  fn()
  Object.assign(envMutable, originalValues)
}
