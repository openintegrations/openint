import type {Assume, DrizzleConfig, SQLWrapper} from 'drizzle-orm'
import type {initDbNeon} from './db.neon'
import type {initDbPg} from './db.pg'
import type {initDbPGLite} from './db.pglite'
import * as schema from './schema/schema'

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

/** Standardize difference across different drizzle postgres drivers */
export interface DrizzleExtension<TDriver extends string> {
  driverType: TDriver
  exec<T extends Record<string, unknown>>(
    query: string | SQLWrapper,
  ): Promise<{rows: Array<Assume<T, {[column: string]: unknown}>>}>
}

type AnyDatabase =
  | ReturnType<typeof initDbNeon>
  | ReturnType<typeof initDbPg>
  | ReturnType<typeof initDbPGLite>

export type DatabaseDriver = AnyDatabase['driverType']

export type Database<TDriver extends DatabaseDriver = DatabaseDriver> = Extract<
  AnyDatabase,
  {driverType: TDriver}
>
