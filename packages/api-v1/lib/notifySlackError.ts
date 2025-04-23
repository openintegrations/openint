import type {Env} from '@openint/env'

/** Type only import to avoid any issues during parsing messing up with instrumentation */
const env = process.env as unknown as Env

export async function notifySlackError(
  message: string,
  body: Record<string, unknown>,
) {
  if (!env.SLACK_INCOMING_WEBHOOK_URL) {
    return
  }
  if (!env.VERCEL_ENV) {
    console.warn('VERCEL_ENV not set, assuming local, skipping slack notif')
    return
  }

  const payload = {
    username: 'OpenInt',
    icon_emoji: ':ghost:',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            `[*${env.VERCEL_ENV}* at *${env.NEXT_PUBLIC_SERVER_URL ?? 'local'}*] ${message}\n` +
            '```' +
            JSON.stringify(body, null, 2) +
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
