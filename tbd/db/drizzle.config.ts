import {defineConfig} from 'drizzle-kit'
import {env} from '@openint/env'

/** Really should be called drizzle-kit config */
export default defineConfig({
  out: './migrations',
  dialect: 'postgresql',
  schema: './schema.ts',
  dbCredentials: {url: env.POSTGRES_URL},
  introspect: {casing: 'preserve'},

  // migrations: {
  //   prefix: 'timestamp',
  //   table: '__drizzle_migrations__',
  //   schema: 'public',
  // },
  strict: true,
  verbose: true,

})
