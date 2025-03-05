import path from 'node:path'
import type {Assume, DrizzleConfig, SQLWrapper} from 'drizzle-orm'
import type {MigrationConfig} from 'drizzle-orm/migrator'
import {Viewer} from '@openint/cdk'
import type {initDbNeon} from './db.neon'
import type {initDbPg, initDbPgDirect} from './db.pg'
import type {initDbPGLite, initDbPGLiteDirect} from './db.pglite'
import * as schema from './schema/schema'

// MARK: - For users

type _Database =
  | ReturnType<typeof initDbNeon>
  | ReturnType<typeof initDbPg>
  | ReturnType<typeof initDbPgDirect>
  | ReturnType<typeof initDbPGLite>
  | ReturnType<typeof initDbPGLiteDirect>

export type DatabaseDriver = _Database['driverType']

export type Database<TDriver extends DatabaseDriver = DatabaseDriver> = Extract<
  _Database,
  {driverType: TDriver}
>

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
    // Schema public does not work as not all variants support it (e.g. pg-proxy)
    // migrationsSchema: 'public',
  }
}

/** Standardize difference across different drizzle postgres drivers */
interface SpecificExtensions<TDrizzle> {
  $asViewer?: (viewer: Viewer) => TDrizzle
  $exec<T extends Record<string, unknown>>(
    query: string | SQLWrapper,
  ): Promise<{rows: Array<Assume<T, {[column: string]: unknown}>>}>
  $migrate(): Promise<void>
  $end?(): Promise<void>
}

export function dbFactory<
  TDriver extends string,
  TDrizzle,
  TExtension extends SpecificExtensions<TDrizzle>,
>(driver: TDriver, _db: TDrizzle, extension: TExtension) {
  Object.assign(_db as {}, {driverType: driver, ...extension})
  const db = _db as typeof _db &
    typeof extension & {driverType: TDriver; readonly _drizzle?: TDrizzle}

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

export type AnyDrizzle = NonNullable<Database['_drizzle']>
export type AnyDatabase = ReturnType<
  typeof dbFactory<DatabaseDriver, AnyDrizzle, SpecificExtensions<AnyDrizzle>>
>
