import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {Database} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import type {RouterContext} from './_base'

const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})

export function viewerFromRequest(req: Request): Viewer {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)/)?.[1]
  return jwt.verifyViewer(token)
}

export function contextFromRequest(req: Request): RouterContext {
  const viewer = viewerFromRequest(req)

  // create db once rather than on every request
  const db = initDbNeon(envRequired.DATABASE_URL, viewer)
  return {viewer, db}
}

export function createRouterContext(input: {
  req: Request
  db: Database
}): RouterContext {
  const viewer = viewerFromRequest(input.req)

  const db = input.db.$asViewer?.(viewer)
  if (!db) {
    throw new Error('as viewer not possible')
  }
  return {viewer, db: db as any}
}
