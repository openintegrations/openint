import {describeEachDatabase} from './test-utils'

describeEachDatabase({drivers: ['pg', 'pglite'], migrate: false}, (db) => {
  test('run migration', async () => {
    await db.$migrate()
    const res = await db.$exec('select * from connector_config')
    expect(res.rows).toEqual([])
  })
})
