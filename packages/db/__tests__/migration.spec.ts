import {describeEachDatabase} from './test-utils'

describeEachDatabase(
  {drivers: ['pg', 'pglite'], migrate: false, enableExtensions: true},
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
