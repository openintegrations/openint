import {neon, neonConfig, Pool} from '@neondatabase/serverless'
import {env} from '@openint/env'

const connectionStringUrl = new URL(env.DATABASE_URL)
neonConfig.useSecureWebSocket =
  connectionStringUrl.hostname !== 'db.localtest.me'
neonConfig.wsProxy =
  connectionStringUrl.hostname === 'db.localtest.me'
    ? (host) => `${host}:4444/v1`
    : undefined

test('node-postgres compatible Pool', async () => {
  // neonConfig.webSocketConstructor = await import('ws) // when using Node.js

  const pool = new Pool({connectionString: connectionStringUrl.toString()})
  const {
    rows: [res],
  } = await pool.query<{sum: number}>('SELECT 2+2 as sum')

  expect(res?.sum).toEqual(4)

  const client = await pool.connect()

  await client.query('BEGIN')
  const res2 = await client.query<{sum: number}>('select 3+3 as sum')
  expect(res2.rows[0]?.sum).toEqual(6)
  await client.query('COMMIT')

  client.release()

  await pool.end()
})

neonConfig.fetchEndpoint = (host) => {
  // localhost does not work because neon proxy expects to work with SNI and would result in error
  // invalid hostname: Common name inferred from SNI ('localhost') is not known
  // Therefore we need to use db.localtest.me as an alternative.
  // to work completely offline, add to `/etc/hosts`
  // 127.0.0.1 db.localtest.me
  const [protocol, port] =
    host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
  return `${protocol}://${host}:${port}/sql`
}

describe('one-shot queries', () => {
  const sql = neon(env.DATABASE_URL)

  test('Using single SQL query', async () => {
    const [res] = await sql`SELECT 1+1 as sum`
    expect(res?.['sum']).toEqual(2)
  })

  test('use non-interactive transaction', async () => {
    const [res2, res3] = await sql.transaction([
      sql`SELECT 2+2 as sum`,
      sql`SELECT 3+3 as sum`,
    ])
    expect(res2?.[0]?.['sum']).toEqual(4)
    expect(res3?.[0]?.['sum']).toEqual(6)
  })

  test('use non-interactive transaction with error', async () => {
    await expect(sql.transaction([sql`SELECT 1/0 as sum`])).rejects.toThrow(
      'division by zero',
    )
  })
})

// Does not work at the moment
// Also unclear whether RLS authorize could work with multiple roles as in our setup, not just anon and authenticated
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('RLS authorize', () => {
  const sql = neon(env.DATABASE_URL, {
    authToken:
      'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yUEhTeFB6RzJGczZvRjVLU1o2TUJDQjRQTjAiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FwcC5vcGVuaW50LmRldiIsImV4cCI6MTc0MDY3ODE0OSwiZnZhIjpbODc4MiwtMV0sImlhdCI6MTc0MDY3ODA4OSwiaXNzIjoiaHR0cHM6Ly9jbGVyay5vcGVuaW50LmRldiIsImp0aSI6ImE2OGQ1NzUyNTIyOGQyZTcxZmZlIiwibmJmIjoxNzQwNjc4MDc5LCJvcmdfaWQiOiJvcmdfMm44RWFXVkw3YUV1Y3R1MGFJdnRYM0I0cmxIIiwib3JnX3Blcm1pc3Npb25zIjpbXSwib3JnX3JvbGUiOiJhZG1pbiIsIm9yZ19zbHVnIjoiYWNtZS1jb3JwIiwicHVibGljX21ldGFkYXRhIjp7IndoaXRlbGlzdGVkIjp0cnVlfSwic2lkIjoic2Vzc18ydE05Y1pGdEdMWWZOYWc0SzlOSUtiZUJrNFkiLCJzdWIiOiJ1c2VyXzJQSFh5dGVFQkxVRFBVRVBuQThsZUFDZW8zZCJ9.b9VMxQz1xrZS5eTq-rstC9kGnYafK5K2E64tGfQqNwlYsLCjX1LhbYNg5ChBEbSERTQaTCh_m5qqJKYkdJOWUp4TyepgJOibYJgk-uvRwriaAmcbFQtCrXHxnS0cHMpV3SRS2JfNwTZqbpljZZEZzOLrmLDiRxQcegnq2B7A_SQDpCX55Lb2WArdiWEem_KwJdCkJMIbrw3_Gmv64YCommUe7rtiNTkh50vqpPBgSSFtaH2_IyCoO5JmleVm6L-6Aor6BvUZ8ZhyNi4yXIdct8dOff9r16yzgPB8RJuzYBqdd68hF6-8cDvF6tEuJSZYt50YosgX7XhAqT4eg0nNvQ',
  })

  test('SELECT', async () => {
    const [res] = await sql`SELECT 1+1 as sum`
    expect(res?.['sum']).toEqual(2)
  })
})
