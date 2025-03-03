import {defineConfig} from 'drizzle-kit'
import {env} from '@openint/env'

/** Really should be called drizzle-kit config */
export default defineConfig({
  out: './migrations',
  dialect: 'postgresql',
  schema: './schema/schema.ts',
  dbCredentials: {url: env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL},
  introspect: {casing: 'preserve'},
  migrations: {
    schema: 'public',
  },
  // migrations: {
  //   prefix: 'timestamp',
  //   table: '__drizzle_migrations__',
  //   schema: 'public',
  // },
  strict: true,
  verbose: true,
})
