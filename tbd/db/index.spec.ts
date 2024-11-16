import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'

const db = drizzle(env.POSTGRES_URL)

test('connect', async () => {
  const res = await db.execute('Select 1')
  console.log('res', res)
})

afterAll(() => db.$client.end())
