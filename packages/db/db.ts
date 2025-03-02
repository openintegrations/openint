import type {DrizzleConfig} from 'drizzle-orm'
import type {initDbNeon} from './db.neon'
import type {initDbPg} from './db.pg'
import type {initDbPGLite} from './db.pglite'
import * as schema from './schema'

export interface DbOptions
  extends Omit<DrizzleConfig<typeof schema>, 'schema'> {}

export function getDrizzleConfig(
  config: DbOptions,
): DrizzleConfig<typeof schema> {
  return {
    logger: true, // make this env dependent
    schema,
    ...config,
  }
}

export type DatabaseDriver = 'neon' | 'pg' | 'pglite'

// prettier-ignore
export type Database<T extends DatabaseDriver = DatabaseDriver>  =
  T extends 'neon' ? ReturnType<typeof initDbNeon> :
  T extends 'pg' ? ReturnType<typeof initDbPg> :
  T extends 'pglite' ? ReturnType<typeof initDbPGLite> :
  never
