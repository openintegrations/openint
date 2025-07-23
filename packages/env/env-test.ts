import {createEnv} from '@t3-oss/env-nextjs'
import {proxyRequired} from '@openint/util/proxy-utils'
import {z} from '@openint/util/zod-utils'

export const testEnv = createEnv({
  server: {
    // MARK: - Actually used

    // Variables set by Vercel when deployed
    VERCEL_URL: z.string().optional(),

    // MARK: - Not validated, may not be used...
    // Core env vars
    DATABASE_URL: z.string().default('postgres://localhost:5432/postgres'),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    // Required for worker to work when deployed
    INNGEST_SIGNING_KEY: z.string().optional(),
    INNGEST_EVENT_KEY: z.string().optional(),

    // Used for scripts / cli only, maybe we should rename them to all _ prefixed to be clear?
    CONNECTION_ID: z.string().optional(),
    CONNECTOR_NAME: z.string().optional(),

    SFDC_INSTANCE_URL: z.string().optional(),
    SFDC_ACCESS_TOKEN: z.string().optional(),
    PROVIDER_CONFIG_KEY: z.string().optional(),

    SYNC_MODE: z.enum(['incremental', 'full']).optional(),
    PAGE_SIZE: z.string().optional(), // TODO: parse number / boolean from str

    // Turn on debug output, including drizzle. Should be a boolean tho
    DEBUG: z.string().optional(),

    conn_greenhouse_API_KEY: z.string().optional(),
    ccfg_plaid__CLIENT_ID: z.string().optional(),
    ccfg_plaid__CLIENT_SECRET_PRODUCTION: z.string().optional(),
    ccfg_plaid__CLIENT_SECRET_SANDBOX: z.string().optional(),
    conn_plaid__ACCESS_TOKEN: z.string().optional(),
    INTEGRATION_TEST_SECRET: z.string().optional(),
    INTEGRATION_TEST_ORG_ID: z.string().optional(),
    INTEGRATION_TEST_API_KEY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z.string().optional(),
    // Where the app is running. Only used by getServerUrl at the moment
    NEXT_PUBLIC_PORT: z.string().optional(),
  },
  runtimeEnv: {
    CONNECTION_ID: process.env['CONNECTION_ID'],
    DEBUG: process.env['DEBUG'],
    INNGEST_EVENT_KEY: process.env['INNGEST_EVENT_KEY'],
    INNGEST_SIGNING_KEY: process.env['INNGEST_SIGNING_KEY'],
    NEXT_PUBLIC_PORT: process.env['NEXT_PUBLIC_PORT'],
    NEXT_PUBLIC_SERVER_URL: process.env['NEXT_PUBLIC_SERVER_URL'],
    PAGE_SIZE: process.env['PAGE_SIZE'],
    DATABASE_URL: process.env['DATABASE_URL'],
    PROVIDER_CONFIG_KEY: process.env['PROVIDER_CONFIG_KEY'],
    CONNECTOR_NAME: process.env['CONNECTOR_NAME'],
    SFDC_ACCESS_TOKEN: process.env['SFDC_ACCESS_TOKEN'],
    SFDC_INSTANCE_URL: process.env['SFDC_INSTANCE_URL'],
    SYNC_MODE: process.env['SYNC_MODE'],
    VERCEL_URL: process.env['VERCEL_URL'],

    DATABASE_URL_UNPOOLED: process.env['DATABASE_URL_UNPOOLED'],
    conn_greenhouse_API_KEY: process.env['conn_greenhouse_API_KEY'],
    ccfg_plaid__CLIENT_ID: process.env['ccfg_plaid__CLIENT_ID'],
    ccfg_plaid__CLIENT_SECRET_PRODUCTION:
      process.env['ccfg_plaid__CLIENT_SECRET_PRODUCTION'],
    ccfg_plaid__CLIENT_SECRET_SANDBOX:
      process.env['ccfg_plaid__CLIENT_SECRET_SANDBOX'],
    INTEGRATION_TEST_SECRET: process.env['INTEGRATION_TEST_SECRET'],
    conn_plaid__ACCESS_TOKEN: process.env['conn_plaid__ACCESS_TOKEN'],
    INTEGRATION_TEST_ORG_ID: process.env['INTEGRATION_TEST_ORG_ID'],
    INTEGRATION_TEST_API_KEY: process.env['INTEGRATION_TEST_API_KEY'],
  },
})

export const testEnvRequired = proxyRequired(testEnv, {
  formatError(key) {
    return new Error(`Missing required env var: ${key}`)
  },
})
