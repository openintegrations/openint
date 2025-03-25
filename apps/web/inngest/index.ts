import type {ServeHandlerOptions} from 'inngest'
import {serve} from 'inngest/next'
import {inngest} from '@openint/engine-backend/inngest'
import type {Events} from '@openint/events'
import {eventMapForInngest} from '@openint/events'
import {withLog} from '@openint/util'
import * as functions from './functions'
import {sendWebhook} from './routines'

const inngestFunctions = [
  ...Object.values(functions),
  // MARK: - Workaround for Inngest not having support for
  // multiple event triggers in a single function
  // @see https://discord.com/channels/842170679536517141/1214066130860118087/1214283616327180318
  ...Object.keys(eventMapForInngest).map((name) =>
    inngest.createFunction(
      {id: `send-webhook.${name}`},
      {event: name as keyof Events},
      sendWebhook,
    ),
  ),
]

export function createInngestHandler(
  opts?: Omit<ServeHandlerOptions, 'client' | 'functions'>,
) {
  return serve(
    withLog('Creating inngest with', {
      client: inngest,
      functions: inngestFunctions,
      // landingPage: process.env['VERCEL_ENV'] !== 'production',
      logLevel: 'warn',
      // Enforce dev env never hit production inngest
      // https://discord.com/channels/842170679536517141/1080275520861782096/1080494988741324870
      baseUrl:
        // For debugging...
        process.env['INNGEST_REGISTER_URL'] ??
        (process.env.NODE_ENV === 'development'
          ? 'http://localhost:8288/fn/register'
          : undefined),
      // For debugging, via e.g. 'http://localhost:3010' via mitmproxy
      serveHost: process.env['INNGEST_SERVE_HOST'],
      ...opts,
    }),
  )
}
