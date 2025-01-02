import {sql, TableConfig} from 'drizzle-orm'
import {PgTable} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/sqlite-proxy'
import {starbase} from 'drizzle-starbase'
import {
  dbUpsertStarbase,
  runMigrationForStandardTableStarbase,
} from './starbase'
import {DbUpsertOptions} from './upsert'

const starbaseDb = drizzle(
  ...starbase(
    process.env['STARBASE_ENDPOINT']!,
    process.env['STARBASE_AUTH_TOKEN']!,
  ),
)

describe('starbase operations', () => {
  const TEST_TABLE = 'test_integration_table'
  const KEY_COLUMNS = {keyColumns: ['source_id', 'id']} as DbUpsertOptions<
    PgTable<TableConfig>
  >

  // Add a custom matcher for ISO dates
  const isValidDate = expect.stringMatching(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
  )

  beforeAll(async () => {
    await runMigrationForStandardTableStarbase(TEST_TABLE)
  })

  beforeEach(async () => {
    // Clear the table before each test
    await starbaseDb.run(sql`DELETE FROM ${sql.identifier(TEST_TABLE)}`)
  })

  test('basic upsert and retrieve', async () => {
    const testData = {
      source_id: 'src1',
      id: '123',
      customer_id: 'cust1',
      connector_name: 'test',
      unified: {data: 'test'},
      raw: {original: 'data'},
    }

    const expectedArray = [
      'src1',
      '123',
      'cust1',
      isValidDate, // created_at
      isValidDate, // updated_at
      'test',
      JSON.stringify({data: 'test'}),
      JSON.stringify({original: 'data'}),
    ]

    await dbUpsertStarbase(TEST_TABLE, [testData], KEY_COLUMNS)

    const result = await starbaseDb.run(
      sql`SELECT * FROM ${sql.identifier(
        TEST_TABLE,
      )} WHERE source_id = 'src1' AND id = '123'`,
    )

    expect(Object.values(result.rows?.[0] ?? {})).toEqual(expectedArray)
  })

  test('batch upsert', async () => {
    const testData = [
      {
        source_id: 'src1',
        id: '123',
        unified: {data: 1},
      },
      {
        source_id: 'src2',
        id: '456',
        unified: {data: 2},
      },
    ]

    const expectedArrays = [
      [
        'src1',
        '123',
        null,
        isValidDate, // created_at
        isValidDate, // updated_at
        null,
        JSON.stringify({data: 1}),
        JSON.stringify({}),
      ],
      [
        'src2',
        '456',
        null,
        isValidDate, // created_at
        isValidDate, // updated_at
        null,
        JSON.stringify({data: 2}),
        JSON.stringify({}),
      ],
    ]

    await dbUpsertStarbase(TEST_TABLE, testData, KEY_COLUMNS)

    const results = await starbaseDb.run(
      sql`SELECT * FROM ${sql.identifier(TEST_TABLE)} ORDER BY id`,
    )

    expect(results.rows).toHaveLength(2)
    results.rows?.forEach((row, index) => {
      expect(Object.values(row as Record<string, unknown>)).toEqual(
        expectedArrays[index],
      )
    })
  })

  test('upsert updates existing record', async () => {
    const initialData = {
      source_id: 'src1',
      id: '123',
      unified: {version: 1},
    }

    const updatedData = {
      source_id: 'src1',
      id: '123',
      unified: {version: 2},
    }

    const expectedArray = [
      'src1',
      '123',
      null,
      isValidDate, // created_at
      isValidDate, // updated_at
      null,
      JSON.stringify({version: 2}),
      JSON.stringify({}),
    ]

    // First insert
    await dbUpsertStarbase(TEST_TABLE, [initialData], KEY_COLUMNS)

    // Update
    await dbUpsertStarbase(TEST_TABLE, [updatedData], KEY_COLUMNS)

    const result = await starbaseDb.run(
      sql`SELECT * FROM ${sql.identifier(
        TEST_TABLE,
      )} WHERE source_id = 'src1' AND id = '123'`,
    )

    expect(Object.values(result.rows?.[0] ?? {})).toEqual(expectedArray)
  })

  test('empty values array', async () => {
    const result = await dbUpsertStarbase(TEST_TABLE, [], KEY_COLUMNS)
    expect(result).toBeUndefined()
  })
})
