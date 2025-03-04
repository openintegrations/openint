import {describeEachDatabase} from './test-utils'

// Extension always cause issues... so we just disable pglite for now...
// ReferenceError: You are trying to `import` a file outside of the scope of the test code.

// at Runtime.linkAndEvaluateModule (node_modules/.pnpm/jest-runtime@30.0.0-alpha.6/node_modules/jest-runtime/build/index.js:678:13)
// at Yr (node_modules/.pnpm/@electric-sql+pglite@0.2.17/node_modules/@electric-sql/pglite/src/extensionUtils.ts:11:5)
describeEachDatabase(
  {drivers: ['pg'], migrate: false, enableExtensions: true},
  (db) => {
    test('run migration', async () => {
      await db.$migrate()
      const res = await db.$exec(
        'select count(*) as count from connector_config',
      )
      expect(res.rows[0]).toMatchObject({count: expect.anything()})
    })
  },
)
