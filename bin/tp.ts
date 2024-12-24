#!/usr/bin/env -S npx tsx
import {exec} from 'node:child_process'
import {parseArgs} from 'node:util'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const args = parseArgs({
  allowPositionals: true,
  options: {
    label: {type: 'string', short: 'n'},
    env: {type: 'string'}, // development | production | staging
    statusColor: {type: 'string'}, // green | yellow | red | 007F3D etc.
  },
})

function getUrl() {
  const envKeyOrUrl = args.positionals[0]!

  try {
    const envKey = envKeyOrUrl
    return [args.values.label || envKey, new URL(process.env[envKey]!)] as const
  } catch {}
  try {
    return [args.values.label, new URL(envKeyOrUrl)] as const
  } catch {}
  throw new Error(`Could not find URL for ${envKeyOrUrl}`)
}

const [label, url] = getUrl()

url.searchParams.set(
  'name',
  [label, `${url.username}@${url.hostname}:${url.port}`]
    .filter((e) => !!e)
    .join(' : '),
)
const {label: _, ...options} = args.values

for (const [key, value] of Object.entries(options)) {
  if (value) {
    url.searchParams.set(key, value)
  }
}

/** Have to do some custom transformation otherwise space gets encoded as + signs */
const postgresURL = url.toString().replaceAll('+', '%20')

console.log('Will open', postgresURL)

exec(`open -a TablePlus '${postgresURL}'`)
