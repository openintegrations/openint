import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {databaseForViewer} from '@openint/db-v1/db-rls'
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
  const db = databaseForViewer(envRequired.DATABASE_URL, viewer)
  return {viewer, db}
}
