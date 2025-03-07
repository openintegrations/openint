import {sql} from 'drizzle-orm'
import {describeEachDatabase} from './test-utils'

// runs in bun but is in fact slower than jest!
describeEachDatabase({drivers: ['pglite-direct']}, (db) => {
  beforeAll(async () => {
    for (const query of [
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
        INSERT INTO customer_data (id, customer_name, email, account_balance, account_manager)
                VALUES (100, 'Acme Corporation', 'contact@acme.com', 50000.00, 'manager_alice');
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
      sql`GRANT ALL ON customer_data TO manager_alice, manager_bob;`,
      // Create policy for manager_alice
      sql`
        CREATE POLICY alice_data_access ON customer_data
                    FOR ALL
                    TO manager_alice
                    USING (account_manager = 'manager_alice')
      `,
      // Create policy for manager_bob
      sql`
        CREATE POLICY bob_data_access ON customer_data
                    FOR ALL
                    TO manager_bob
                    USING (account_manager = 'manager_bob');
      `,
    ]) {
      await db.$exec(query)
    }
  })

  test('Update works for valid inserts', async () => {
    const res = await db.transaction(async (tx) => {
      await tx.execute(`SET LOCAL ROLE manager_alice`)
      return await tx.execute(`
        INSERT INTO customer_data (id, customer_name, email, account_balance, account_manager)
        VALUES (100, 'Updated', 'contact@acme.com', 50000.00, 'manager_alice')
        ON CONFLICT (id)
        DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            email = EXCLUDED.email,
            account_balance = EXCLUDED.account_balance,
            account_manager = EXCLUDED.account_manager
        RETURNING *
`)
    })
    expect(res.rows[0]).toMatchObject({id: 100, customer_name: 'Updated'})
  })

  test('Update fails when insert violates RLS', async () => {
    await expect(
      db.transaction(async (tx) => {
        await tx.execute(`SET LOCAL ROLE manager_alice`)
        return await tx.execute(`
        INSERT INTO customer_data (id, customer_name)
        VALUES (100, 'insert no rls')
        ON CONFLICT (id)
        DO UPDATE SET
            customer_name = EXCLUDED.customer_name
        RETURNING *
`)
      }),
    ).rejects.toThrow(
      'new row violates row-level security policy for table "customer_data"',
    )
  })
})
