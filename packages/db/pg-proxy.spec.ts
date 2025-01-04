import {sql} from 'drizzle-orm'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import {createDbDebuggingProxy} from './pg-proxy'

describe('pg-proxy mode', () => {
  test('local server', async () => {
    const db = drizzleProxy(createDbDebuggingProxy().remoteCallback)
    const res = await db.execute(sql`SELECT 1+1 as sum`)
    expect(res).toEqual([{sum: 2}])
  })
})
