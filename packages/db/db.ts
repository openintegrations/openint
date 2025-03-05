import path from 'node:path'
import type {Assume, DrizzleConfig, SQLWrapper} from 'drizzle-orm'
import type {MigrationConfig} from 'drizzle-orm/migrator'
import {Viewer} from '@openint/cdk'
import type {initDbNeon} from './db.neon'
import type {initDbPg, initDbPgDirect} from './db.pg'
import type {initDbPGLite, initDbPGLiteDirect} from './db.pglite'
import * as schema from './schema/schema'

// MARK: - For users

type AnyDatabase =
  | ReturnType<typeof initDbNeon>
  | ReturnType<typeof initDbPg>
  | ReturnType<typeof initDbPgDirect>
  | ReturnType<typeof initDbPGLite>
  | ReturnType<typeof initDbPGLiteDirect>

export type DatabaseDriver = AnyDatabase['driverType']

export type Database<TDriver extends DatabaseDriver = DatabaseDriver> = Extract<
  AnyDatabase,
  {driverType: TDriver}
>

export type DatabaseTransaction<
  TDriver extends DatabaseDriver = DatabaseDriver,
> = Parameters<Parameters<Database<TDriver>['transaction']>[0]>[0]

// MARK: - For Implementors

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
interface SpecificExtensions<TDatabase> {
  $asViewer?: (viewer: Viewer) => TDatabase
  $exec<T extends Record<string, unknown>>(
    query: string | SQLWrapper,
  ): Promise<{rows: Array<Assume<T, {[column: string]: unknown}>>}>
  $migrate(): Promise<void>
  $end?(): Promise<void>
}

export function dbFactory<TDriver extends string, TDatabase>(
  driver: TDriver,
  _db: TDatabase,
  extension: SpecificExtensions<TDatabase>,
) {
  Object.assign(_db as {}, {driverType: driver, ...extension})
  const db = _db as typeof _db & typeof extension & {driverType: TDriver}

  /** Helpers that are not driver specific */
  const additioanlExtensions = {
    $truncateAll: async () => {
      const tables = await db.$exec<{table_name: string}>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' and table_type = 'BASE TABLE' and table_name != '__drizzle_migrations'",
      )
      for (const {table_name} of tables.rows) {
        await db.$exec(`TRUNCATE TABLE ${table_name} CASCADE`)
      }
    },
  }

  Object.assign(db, additioanlExtensions)
  return db as typeof db & typeof additioanlExtensions
}
