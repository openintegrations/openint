import type {Config} from 'drizzle-kit'

import {env} from '@openint/env'

export default {
  out: './migrations',
  dialect: 'postgresql',
  schema: './schema/schema.ts',
  dbCredentials: {url: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL},
  introspect: {casing: 'preserve'},
  migrations: {},
  // migrations: {
  //   prefix: 'timestamp',
  //   table: '__drizzle_migrations__',
  //   schema: 'public',
  // },
  strict: true,
  verbose: true,
} satisfies Config
export type {Config}
