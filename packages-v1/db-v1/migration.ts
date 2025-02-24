import {PgliteDatabase} from 'drizzle-orm/pglite'
import {migrate as migratePgLite} from 'drizzle-orm/pglite/migrator'
import {migrate} from 'drizzle-orm/postgres-js/migrator'
import * as path from 'node:path'
import type {createDatabase, createLiteDatabase, Database} from './db'

export async function bootstrap(db: Database) {
  if (db instanceof PgliteDatabase) {
    await migratePgLite(db as ReturnType<typeof createLiteDatabase>, {
      migrationsFolder: path.join(__dirname, './migrations'),
    })
  } else {
    await migrate(db as ReturnType<typeof createDatabase>, {
      migrationsFolder: path.join(__dirname, './migrations'),
    })
  }
  // No need no more
  // const statements = await getMigrationStatements()
  // for (const statement of statements) {
  //   await db.execute(statement)
  // }
}
