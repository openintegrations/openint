import {neon, neonConfig, Pool} from '@neondatabase/serverless'
import {env} from '@openint/env'

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

const sql = neon(env.DATABASE_URL)

test('Using single SQL query', async () => {
  const [res] = await sql`SELECT 1+1 as sum`
  expect(res?.['sum']).toEqual(2)
})

test('or using Pool', async () => {
  const connectionStringUrl = new URL(env.DATABASE_URL)
  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== 'db.localtest.me'
  neonConfig.wsProxy =
    connectionStringUrl.hostname === 'db.localtest.me'
      ? (host) => `${host}:4444/v1`
      : undefined
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
