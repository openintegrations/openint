import {createDatabase} from '@openint/db-v1'
import {env} from '@openint/env'
import type {RouterContext} from './_base'

export function contextFromRequest(_req: Request): RouterContext {
  // create db once rather than on every request
  const db = createDatabase({url: env.DATABASE_URL})
  return {viewer: {role: 'system' as const}, db}
}
