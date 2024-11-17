import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {sql} from 'drizzle-orm'
import {check, pgTable} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'
import {inferTable} from './upsert-from-event'

beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute('DROP DATABASE IF EXISTS testing')
  await masterDb.execute('CREATE DATABASE testing')
  await masterDb.$client.end()
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = '/testing'
const db = drizzle(dbUrl.toString(), {logger: true})

test('connect', async () => {
  const res = await db.execute('select 1+1 as sum')
  expect(res[0]).toEqual({sum: 2})
})

test('migrate', async () => {
  const table = pgTable(
    'account',
    (t) => ({id: t.serial().primaryKey(), email: t.text()}),
    (table) => [check('email_check', sql`${table.email} LIKE '%@%'`)],
  )
  const migrations = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  )
  expect(migrations).toEqual([
    `CREATE TABLE IF NOT EXISTS "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	CONSTRAINT "email_check" CHECK ("account"."email" LIKE '%@%')
);
`,
  ])
  for (const migration of migrations) {
    await db.execute(migration)
  }
  await db.insert(table).values({email: 'hello@world.com'})
  const rows = await db.select().from(table).execute()
  expect(rows).toEqual([{id: 1, email: 'hello@world.com'}])
  await expect(db.insert(table).values({email: 'nihao.com'})).rejects.toThrow(
    'violates check constraint',
  )
})

afterAll(() => db.$client.end())
