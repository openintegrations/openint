import {sql} from 'drizzle-orm'
import {describeEachDatabase} from '../__tests__/test-utils'
import {parseNumber} from './type-parsers'

describeEachDatabase({drivers: 'all', __filename}, (db) => {
  test('numeric type parser', async () => {
    const res = await db.$exec(sql`SELECT 1.0::numeric as numeric`)
    expect(res.rows[0]?.numeric).toEqual(1.0)
  })

  test('count type parser', async () => {
    const res = await db.$exec(sql`SELECT count(*) from pg_catalog.pg_tables`)
    expect(res.rows[0]?.count).toEqual(expect.any(Number))
  })

  test('large numeric type parser', async () => {
    await expect(
      db.$exec(
        sql`SELECT 9999999999999999999999999999999999::numeric as numeric`,
      ),
    ).rejects.toThrow('Number overflow')
  })

  test('timestamptz type parser', async () => {
    const timestamp = '2024-01-01T12:00:00Z'
    const res = await db.$exec(`SELECT '${timestamp}'::timestamptz as ts`)
    expect(res.rows[0]?.ts).toEqual('2024-01-01 12:00:00+00')
  })
})

test('parseNumber', () => {
  expect(() => parseNumber('9007190009254740992')).toThrow('Number overflow')
  expect(() => parseNumber('-9007199254740992')).toThrow('Number overflow')
  expect(parseNumber('9007199254740991')).toBe(9007199254740991)
  expect(parseNumber('-9007199254740991')).toBe(-9007199254740991)
  expect(parseNumber('123.456')).toBe(123.456)
  expect(parseNumber('0')).toBe(0)
})
