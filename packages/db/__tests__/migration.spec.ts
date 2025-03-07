import {sql} from 'drizzle-orm'
import {describeEachDatabase} from './test-utils'

jest.setTimeout(15_000)

// runs in bun but is in fact slower than jest!
describeEachDatabase({drivers: 'all', migrate: false}, (db) => {
  test('run migration', async () => {
    await db.$migrate()
    const res = await db.$exec('select count(*) as count from connector_config')
    expect(res.rows[0]).toMatchObject({count: expect.anything()})

    // Should be noop
    await db.$migrate()
    const rows = await db
      .$exec<{table_schema: string; table_name: string}>(
        sql`
          SELECT
            table_schema,
            table_name
          FROM
            information_schema.tables
          WHERE
            table_type = 'BASE TABLE'
            AND table_schema NOT IN ('pg_catalog', 'information_schema')
          ORDER BY
            table_schema,
            table_name;
        `,
      )
      .then((r) => r.rows)

    expect(rows).toContainEqual({
      table_schema: 'public',
      table_name: 'event',
    })
  })
})
