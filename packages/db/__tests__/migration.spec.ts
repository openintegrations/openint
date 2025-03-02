import {env} from '@openint/env'
import type {Database} from './test-utils'
import {createTestDatabase, runMigration} from './test-utils'

const dbName = 'migration'

let db: Database

beforeAll(async () => {
  db = await createTestDatabase(env.DATABASE_URL, dbName)
})

test('run migration', async () => {
  await runMigration(db)
  const res = await db.execute('select * from connector_config')
  expect(res).toEqual([])
})
