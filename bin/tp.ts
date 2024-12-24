#!/usr/bin/env -S NODE_NO_WARNINGS=1 npx tsx
import {exec} from 'node:child_process'
import {parseArgs} from 'node:util'

const USAGE = `
TablePlus CLI

Examples:
./bin/tp.ts DOCKER_POSTGRES_URL
./bin/tp.ts STAGING_URL --label "Staging DB" --env staging --statusColor yellow
./bin/tp.ts postgres://user:password@localhost:5432/mydb

Positional Arguments:
  <envKeyOrUrl>    The environment variable key containing the database URL
                   or a direct database URL (e.g., postgres://user:pass@host:port/db).
Options:
  --label, -n                  A custom label for the connection (e.g., "My Database").
  --env                        The environment name. {local, development, production, staging, test}
  --statusColor                The status color for the connection iun hex codes: e.g., 007F3D, FFFF00

  --safeModeLevel              The safety level for query execution. Options:
                               - 0: Silent Mode - Send queries to the server without any warnings.
                               - 1: Alert Mode - Warn before sending queries to the server.
                               - 2: Safe Mode - Prompt for password before sending queries to the server.

  --advancedSafeModeLevel      Additional control for Safe/Alert mode behavior. Options:
                               - 0: Apply Alert/Safe mode to all queries.
                               - 1: Exclude SELECT/EXPLAIN/SHOW queries from Alert/Safe mode.
  --schema                     The database schema to connect to (e.g., "public", "custom_schema").

Defaults:
  If --env is not provided, defaults to "local" for localhost connections.
  If --statusColor is not provided, defaults to "007F3D" for localhost connections.
`

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const args = parseArgs({
  allowPositionals: true,
  options: {
    label: {type: 'string', short: 'n'},
    env: {type: 'string'}, // development | production | staging
    statusColor: {type: 'string'}, // green | yellow | red | 007F3D etc.
    /**
     * 0: Silent Mode - Send queries to the server without any warnings
     * 1: Alert Mode - Warn before sending queries to the server
     * 2: Safe Mode - Prompt for password before sending queries to the server
     */
    safeModeLevel: {type: 'string'}, // 0 | 1 | 2
    /**
     * 0: Alert / Safe mode for all queries
     * 1: Alert / Safe mode except for SELECT/EXPLAIN/SHOW queries
     */
    advancedSafeModeLevel: {type: 'string'}, // 0 | 1
    schema: {type: 'string'},
  },
})

function getUrl() {
  const envKeyOrUrl = args.positionals[0]

  if (!envKeyOrUrl) {
    console.error(USAGE)
    process.exit(0)
  }

  try {
    const envKey = envKeyOrUrl
    return [args.values.label || envKey, new URL(process.env[envKey]!)] as const
  } catch {}
  try {
    return [args.values.label, new URL(envKeyOrUrl)] as const
  } catch {}
  throw new Error(`Could parse database URL: ${envKeyOrUrl}`)
}

const [label, url] = getUrl()

// Default to 5432 for postgres connections
const port = url.port || (url.protocol.startsWith('postgres') ? '5432' : '')

const name = [label, `${url.username}@${url.hostname}${port ? `:${port}` : ''}`]
  .filter((e) => !!e)
  .join(' : ')

const {label: _, ...options} = args.values

if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
  options.env = options.env || 'local'
  options.statusColor = options.statusColor || '007F3D'
  options.safeModeLevel = '0'
} else {
  // Default to warnings for non-local connections
  options.statusColor = 'FFA500'
  options.safeModeLevel = '1'
  options.advancedSafeModeLevel = '1'
}

url.searchParams.set('name', name)
for (const [key, value] of Object.entries(options)) {
  if (value) {
    url.searchParams.set(key, value)
  }
}

/** Have to do some custom transformation otherwise space gets encoded as + signs */
const postgresURL = url.toString().replaceAll('+', '%20')

console.log('Will open', name)

exec(`open -a TablePlus '${postgresURL}'`)
