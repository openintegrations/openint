import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {Database} from '@openint/db'
import {envRequired} from '@openint/env'
import type {RouterContext, ViewerContext} from './_base'

const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})

export function viewerFromRequest(req: Request): Viewer {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)/)?.[1]
  return jwt.verifyViewer(token)
}

export function createRouterContext({
  req,
  db,
}: {
  req: Request
  db: Database
}): RouterContext {
  const currentViewer = viewerFromRequest(req)

  function createViewerContext(viewer: Viewer): ViewerContext {
    const dbForViewer = db.$asViewer?.(viewer)
    if (!dbForViewer) {
      throw new Error(`${db.driverType} does not support asViewer`)
    }
    return {viewer, db: dbForViewer}
  }

  return {...createViewerContext(currentViewer), as: createViewerContext}
}
