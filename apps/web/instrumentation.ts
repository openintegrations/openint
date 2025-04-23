import type {Instrumentation} from 'next'
import type {Env} from '@openint/env'

import * as Sentry from '@sentry/nextjs'

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
  if (env.SLACK_INCOMING_WEBHOOK_URL) {
    const payload = {
      username: 'OpenInt',
      icon_emoji: ':ghost:',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              `[*${env.VERCEL_ENV ?? 'local'}* at *${env.NEXT_PUBLIC_SERVER_URL ?? 'local'}*] Server crashed\n` +
              '```' +
              JSON.stringify(
                {
                  err: {message: String(err), digest: err.digest},
                  req: {
                    method: req.method,
                    path: req.path,
                    host: req.headers['host'],
                  },
                  ctx,
                },
                null,
                2,
              ) +
              '```',
          },
        },
      ],
    }

    const res = await fetch(env.SLACK_INCOMING_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.status !== 200) {
      console.error('Unable to post error to slack', res, await res.text())
    }
  }
}
