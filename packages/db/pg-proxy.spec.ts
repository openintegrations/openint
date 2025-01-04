import {sql} from 'drizzle-orm'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import {createDbDebuggingProxy} from './pg-proxy'

describe('pg-proxy mode', () => {
  const db = drizzleProxy(createDbDebuggingProxy().remoteCallback)

  test('successful request', async () => {
    const res = await db.execute(sql`SELECT 1+1 as sum`)
    expect(res).toEqual([{sum: 2}])
  })

  test('failed request', async () => {
    await expect(() => db.execute(sql`SELEC2 10 as sum`)).rejects.toThrow(
      'syntax error at or near "SELEC2"',
    )
  })
})
