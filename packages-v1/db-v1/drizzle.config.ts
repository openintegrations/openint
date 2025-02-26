import {defineConfig} from 'drizzle-kit'
import {env} from '@openint/env'

export default defineConfig({
  dialect: 'postgresql',
  ...(env.PGLITE ? {driver: 'pglite'} : {}),
  schema: './schema.ts',
  out: './migrations',
  dbCredentials: {url: env.DATABASE_URL},
  strict: true,
  verbose: true,
  introspect: {casing: 'preserve'},
})
