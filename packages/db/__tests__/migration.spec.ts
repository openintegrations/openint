import {sql} from 'drizzle-orm'
import {describeEachDatabase} from './test-utils'

// Extension always cause issues... so we just disable pglite for now...
// ReferenceError: You are trying to `import` a file outside of the scope of the test code.

// at Runtime.linkAndEvaluateModule (node_modules/.pnpm/jest-runtime@30.0.0-alpha.6/node_modules/jest-runtime/build/index.js:678:13)
// at Yr (node_modules/.pnpm/@electric-sql+pglite@0.2.17/node_modules/@electric-sql/pglite/src/extensionUtils.ts:11:5)
describeEachDatabase(
  {drivers: ['pglite', 'pglite_direct'], migrate: false},
  (db) => {
    test('run migration', async () => {
      await db.$migrate()
      const res = await db.$exec(
        'select count(*) as count from connector_config',
      )
      expect(res.rows[0]).toMatchObject({count: expect.anything()})

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
  },
)
