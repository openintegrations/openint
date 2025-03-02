import path from 'node:path'
import type {Assume, DrizzleConfig, SQLWrapper} from 'drizzle-orm'
import type {MigrationConfig} from 'drizzle-orm/migrator'
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

/** Needs to be manually kept in sync with ../drizzle.config.ts */
export function getMigrationConfig(): MigrationConfig {
  return {
    migrationsFolder: path.join(__dirname, './migrations'),
    migrationsSchema: 'public',
  }
}

/** Standardize difference across different drizzle postgres drivers */
export interface DrizzleExtension<TDriver extends string> {
  driverType: TDriver
  exec<T extends Record<string, unknown>>(
    query: string | SQLWrapper,
  ): Promise<{rows: Array<Assume<T, {[column: string]: unknown}>>}>
  migrate(): Promise<void>
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
