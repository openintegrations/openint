import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {inferTable, isValidDateString} from './upsert-from-event'

test.each([
  ['2021-01-01T00:00:00Z', true],
  ['2021-01-01T00:00:00', false], // missing timezone, not valid as a result
  ['2021-01-01', true],
  ['2021-01', true],
  ['2021', true],
  ['12', false],
  ['202', false],
  ['2021-01-01T00:00:00+00:00', true],
  ['Sun, Nov 17, 5:00 PM', false],
  ['Sat Nov 16 2024 15:28:04 GMT-0800 (Pacific Standard Time)', false],
])('isValidDateString(%s) -> %o', (input, valid) => {
  expect(isValidDateString(input)).toEqual(valid)
})

test('infer', async () => {
  const table = inferTable('transaction', {
    id: '1',
    intId: 2,
    amount: 1.23,
    created_at: '2021-01-01T00:00:00Z',
    updated_at: new Date(),
    is_deleted: false,
    raw: {key: 'value'},
    array_value: [{key: 'value'}],
  })
  const migrations = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  )
  expect(migrations).toMatchSnapshot()
})
