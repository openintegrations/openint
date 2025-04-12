import {sql} from 'drizzle-orm'
import {PgDialect, pgTable, serial, text} from 'drizzle-orm/pg-core'
import {applyLimitOffset} from '../lib/applyLimitOffset'

describe('sql generation', () => {
  const pgDialect = new PgDialect()

  test('identifier', () => {
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        sql`SELECT true FROM ${sql.identifier('connection')}`,
      ),
    ).toMatchObject({sql: 'SELECT true FROM "connection"', params: []})
  })

  test('implicit identifiers', () => {
    const table = pgTable('connection', {
      id: serial().primaryKey(),
      Name: text(),
    })

    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        sql`SELECT ${table.Name}, ${table.id} FROM ${table}`,
      ),
    ).toMatchObject({
      sql: 'SELECT "connection"."Name", "connection"."id" FROM "connection"',
      params: [],
    })
  })

  test('concatenate queries', () => {
    // prettier-ignore
    const fragment = sql`1 = 1`
    expect(
      // prettier-ignore
      pgDialect.sqlToQuery(sql`SELECT true WHERE ${fragment} AND 2 != 1`),
    ).toMatchObject({sql: 'SELECT true WHERE 1 = 1 AND 2 != 1', params: []})
  })

  test('dates', () => {
    const date = new Date()
    expect(
      // prettier-ignore
      pgDialect.sqlToQuery(sql`SELECT true WHERE created > ${date}`),
    ).toMatchObject({sql: 'SELECT true WHERE created > $1', params: [date]})
  })

  test('apply limit offset', () => {
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        applyLimitOffset(sql`SELECT * FROM connection`, {limit: 10, offset: 5}),
      ),
    ).toMatchObject({
      sql: 'SELECT * FROM connection LIMIT $1 OFFSET $2',
      params: [10, 5],
    })
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        applyLimitOffset(sql`SELECT * FROM connection`, {limit: 10}),
      ),
    ).toMatchObject({
      sql: 'SELECT * FROM connection LIMIT $1',
      params: [10],
    })
    expect(
      // prettier-ignore
      pgDialect.sqlToQuery(applyLimitOffset(sql`SELECT * FROM connection`, {})),
    ).toMatchObject({
      sql: 'SELECT * FROM connection',
      params: [],
    })
  })

  test('array', () => {
    // prettier-ignore
    expect(pgDialect.sqlToQuery(sql`SELECT ${1} + ${2}`)).toMatchObject({
      sql: 'SELECT $1 + $2',
      params: [1, 2],
    })

    const ids = ['i1', 'i2']

    // array input is flattened by default, this would be an error
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        sql`SELECT * from connection where id = ANY(${ids}) and status = ${'active'}`,
      ),
    ).toMatchObject({
      sql: 'SELECT * from connection where id = ANY(($1, $2)) and status = $3',
      params: ['i1', 'i2', 'active'],
    })

    // with param array is passed as a single value
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        sql`SELECT * from connection where id = ANY(${sql.param(
          ids,
        )}) and status = ${'active'}`,
      ),
    ).toMatchObject({
      sql: 'SELECT * from connection where id = ANY($1) and status = $2',
      params: [['i1', 'i2'], 'active'],
    })
    // Single item should also work
    expect(
      pgDialect.sqlToQuery(
        // prettier-ignore
        sql`SELECT * from connection where id = ANY(${sql.param([
          'i3',
        ])}) and status = ${'active'}`,
      ),
    ).toMatchObject({
      sql: 'SELECT * from connection where id = ANY($1) and status = $2',
      params: [['i3'], 'active'],
    })
  })
})
