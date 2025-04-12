import {sql} from 'drizzle-orm'
import {describeEachDatabase} from '../__tests__/test-utils'
import {dbUpsert, dbUpsertOne} from './upsert'

jest.setTimeout(15_000)

describeEachDatabase({drivers: 'all', __filename}, (db) => {
  beforeAll(async () => {
    await db.$exec(sql`
      CREATE TABLE IF NOT EXISTS "test_user" (
        id text PRIMARY KEY,
        name text DEFAULT 'unnamed',
        COUNT integer,
        data jsonb
      );
    `)
  })

  const row = {
    id: '123',
    name: 'original',
    count: 1,
    data: {hello: 'world'},
  }

  beforeEach(async () => {
    await dbUpsertOne(db, 'test_user', row, {
      keyColumns: ['id'],
    })
  })

  afterEach(async () => {
    await db.$exec(sql`TRUNCATE "test_user"`)
  })

  test('upsert with inferred table', async () => {
    const {rows: ret} = await db.$exec(sql`
      SELECT
        *
      FROM
        "test_user"
    `)
    expect(ret[0]).toEqual(row)
  })

  test('null means null', async () => {
    await dbUpsertOne(
      db,
      'test_user',
      {...row, name: null},
      {keyColumns: ['id']},
    )
    const {rows: ret2} = await db.$exec(sql`
      SELECT
        *
      FROM
        "test_user"
    `)
    expect(ret2[0]).toEqual({...row, name: null})
  })

  test('ignore undefined values by default', async () => {
    await dbUpsertOne(
      db,
      'test_user',
      {...row, name: undefined},
      {keyColumns: ['id']},
    )
    const {rows: ret2} = await db.$exec(sql`
      SELECT
        *
      FROM
        "test_user"
    `)
    expect(ret2[0]).toEqual(row)
  })

  test('treat undefined as sql DEFAULT keyword', async () => {
    await dbUpsertOne(
      db,
      'test_user',
      {...row, name: undefined},
      {keyColumns: ['id'], undefinedAsDefault: true},
    )
    const {rows: ret2} = await db.$exec(sql`
      SELECT
        *
      FROM
        "test_user"
    `)
    expect(ret2[0]).toEqual({...row, name: 'unnamed'})
  })

  test('only use the firstRow for inferring schema', async () => {
    await dbUpsert(
      db,
      'test_user',
      [
        {id: 'new_id', count: 3},
        {...row, name: undefined},
      ],
      {keyColumns: ['id'], undefinedAsDefault: true},
    )

    expect(
      await db
        .$exec(sql`
          SELECT
            *
          FROM
            "test_user"
        `)
        .then((r) => r.rows[0]),
    ).toEqual({...row, name: 'original'})
  })

  test('fail without key column', () => {
    expect(() => dbUpsertOne(db, 'test', {val: 1})).toThrow(
      'Unable to upsert without keyColumns',
    )
  })

  test('change inferred schema between upserts to same table', async () => {
    await db.$exec(sql`
      CREATE TABLE IF NOT EXISTS "pipeline" (id text PRIMARY KEY, num integer, str text);
    `)

    await dbUpsertOne(db, 'pipeline', {id: 1, num: 123}, {keyColumns: ['id']})

    // This is no longer the case due to workaround
    // await expect(
    //   dbUpsertOne(db, 'pipeline', {id: 2, str: 'my'}, {keyColumns: ['id']}),
    // ).rejects.toThrow('column "undefined" of relation "pipeline"')
    // clearing casing cache causes it to work

    await dbUpsertOne(db, 'pipeline', {id: 2, str: 'my'}, {keyColumns: ['id']})
  })
})
