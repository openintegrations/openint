import {sql} from 'drizzle-orm'
import {describeEachDatabase} from './__tests__/test-utils'

describeEachDatabase({drivers: 'all', __filename}, (db) => {
  test('numeric type parser', async () => {
    const res = await db.$exec(sql`SELECT 1.0::numeric as numeric`)
    expect(res.rows[0]?.numeric).toEqual(1.0)
  })

  test('count type parser', async () => {
    const res = await db.$exec(sql`SELECT count(*) from pg_catalog.pg_tables`)
    expect(res.rows[0]?.count).toEqual(expect.any(Number))
  })
})
