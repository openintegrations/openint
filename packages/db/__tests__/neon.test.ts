import {neon, neonConfig, Pool} from '@neondatabase/serverless'
import {drizzle as drizzleNeonHttp} from 'drizzle-orm/neon-http'
import {drizzle as drizzleNeonServerless} from 'drizzle-orm/neon-serverless'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import {env} from '@openint/env'

const connectionStringUrl = new URL(env.DATABASE_URL)
neonConfig.useSecureWebSocket =
  connectionStringUrl.hostname !== 'db.localtest.me'
neonConfig.wsProxy =
  connectionStringUrl.hostname === 'db.localtest.me'
    ? (host) => `${host}:4444/v1`
    : undefined

jest.setTimeout(30000)

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

describe('rls via non-interactive transaction', () => {
  const sql = neon(env.DATABASE_URL)

  afterAll(async () => {
    // Clean up if needed
    await sql.transaction([
      // Drop policies first
      sql`DROP POLICY IF EXISTS alice_data_access ON customer_data;`,
      sql`DROP POLICY IF EXISTS bob_data_access ON customer_data;`,

      // Revoke permissions
      sql`REVOKE SELECT ON customer_data FROM manager_alice, manager_bob;`,
      sql`REVOKE USAGE ON SCHEMA public FROM manager_alice, manager_bob;`,

      // Drop the table (this will also delete all data)
      sql`DROP TABLE IF EXISTS customer_data;`,

      // Drop roles
      sql`DROP ROLE IF EXISTS manager_alice;`,
      sql`DROP ROLE IF EXISTS manager_bob;`,
    ])
  })

  beforeAll(async () => {
    // Create a sample table
    await sql
      .transaction([
        sql`
          CREATE TABLE customer_data (
              id SERIAL PRIMARY KEY,
              customer_name TEXT NOT NULL,
              email TEXT NOT NULL,
              account_balance DECIMAL(10, 2) NOT NULL,
              account_manager TEXT NOT NULL
          );
        `,
        // Enable Row-Level Security on the table
        sql`ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;`,
        // Insert first sample row
        sql`
          INSERT INTO customer_data (customer_name, email, account_balance, account_manager)
                  VALUES ('Acme Corporation', 'contact@acme.com', 50000.00, 'manager_alice');
        `,
        // Insert second sample row
        sql`
          INSERT INTO customer_data (customer_name, email, account_balance, account_manager)
                  VALUES ('Globex Industries', 'info@globex.com', 75000.00, 'manager_bob');
        `,
        // Create first role
        sql`CREATE ROLE manager_alice;`,
        // Create second role
        sql`CREATE ROLE manager_bob;`,
        // Grant schema usage to both roles
        sql`GRANT USAGE ON SCHEMA public TO manager_alice, manager_bob;`,
        // Grant SELECT permission on the table to both roles
        sql`GRANT SELECT ON customer_data TO manager_alice, manager_bob;`,
        // Create policy for manager_alice
        sql`
          CREATE POLICY alice_data_access ON customer_data
                      FOR ALL
                      TO manager_alice
                      USING (account_manager = 'manager_alice');
        `,
        // Create policy for manager_bob
        sql`
          CREATE POLICY bob_data_access ON customer_data
                      FOR ALL
                      TO manager_bob
                      USING (account_manager = 'manager_bob');
        `,
      ])
      .catch(() => null)
  })

  test('via drizzle neon serverless does work', async () => {
    const pool = new Pool({connectionString: connectionStringUrl.toString()})
    const db = drizzleNeonServerless({client: pool})

    // eslint-disable-next-line arrow-body-style
    const _res = await db.transaction(async (trx) => {
      return trx.execute(`
          select set_config('role', 'manager_alice', true);
          SELECT * FROM customer_data;
        `)
    })
    const res = _res as unknown as Array<typeof _res>
    expect(res[1]?.rows).toEqual([
      {
        id: 1,
        customer_name: 'Acme Corporation',
        email: 'contact@acme.com',
        account_balance: '50000.00',
        account_manager: 'manager_alice',
      },
    ])
  })

  test('directly with neon client', async () => {
    const [, res1] = await sql.transaction([
      sql`select set_config('role', 'manager_alice', true);`, // sql`SET LOCAL ROLE manager_alice;` equivalent
      sql`SELECT * FROM customer_data;`,
    ])
    expect(res1).toHaveLength(1)
    expect(res1?.[0]).toMatchObject({account_manager: 'manager_alice'})

    const [, res2] = await sql.transaction([
      sql`select set_config('role', 'manager_bob', true);`, // sql`SET LOCAL ROLE manager_bob;` equivalent
      sql`SELECT * FROM customer_data;`,
    ])
    expect(res2).toHaveLength(1)
    expect(res2?.[0]).toMatchObject({account_manager: 'manager_bob'})

    const [res3] = await sql.transaction([sql`SELECT * FROM customer_data;`])
    expect(res3).toHaveLength(2)
    expect(res3?.[0]).toMatchObject({account_manager: 'manager_alice'})
    expect(res3?.[1]).toMatchObject({account_manager: 'manager_bob'})

    const res4 = await sql`SELECT * FROM customer_data;`
    expect(res4).toHaveLength(2)
    expect(res4?.[0]).toMatchObject({account_manager: 'manager_alice'})
    expect(res4?.[1]).toMatchObject({account_manager: 'manager_bob'})
  })

  // Does not work due to
  // Error: No transactions support in neon-http driver

  test('via drizzle neon http fails', async () => {
    const db = drizzleNeonHttp({client: sql})

    await expect(
      db.transaction(async (trx) =>
        trx.execute(`
select set_config('role', 'manager_alice', true);
SELECT * FROM customer_data;
        `),
      ),
    ).rejects.toThrow('No transactions support in neon-http driver')
  })

  test('via drizzle proxy does work', async () => {
    const db = drizzleProxy(async (query, params, _method) => {
      // TODO: Do something about _method, whatever that is about...
      const [, res] = await sql.transaction([
        sql`select set_config('role', 'manager_alice', true);`,
        sql(query, params),
      ])
      return {rows: res ?? []}
    })

    const res = await db.execute('SELECT * FROM customer_data;')
    expect(res).toEqual([
      {
        id: 1,
        customer_name: 'Acme Corporation',
        email: 'contact@acme.com',
        account_balance: '50000.00',
        account_manager: 'manager_alice',
      },
    ])
  })
})

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
