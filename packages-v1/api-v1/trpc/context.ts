import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {AnyDatabase} from '@openint/db/db'
import {envRequired} from '@openint/env'
import type {RouterContext, ViewerContext} from './_base'

const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})

export function viewerFromRequest(req: Request): Viewer {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)/)?.[1]
  return jwt.verifyViewer(token)
}

export function routerContextFromRequest({
  req,
  ...ctx
}: {req: Request} & Omit<CreateRouterContextOptions, 'viewer'>) {
  return routerContextFromViewer({...ctx, viewer: viewerFromRequest(req)})
}

interface CreateRouterContextOptions {
  viewer: Viewer
  db: AnyDatabase
}

export function routerContextFromViewer({
  viewer: currentViewer,
  db,
}: CreateRouterContextOptions): RouterContext {
  function createViewerContext(viewer: Viewer): ViewerContext {
    const dbForViewer = db.$asViewer?.(viewer)
    if (!dbForViewer) {
      throw new Error(`${db.driverType} does not support asViewer`)
    }
    return {viewer, db: dbForViewer}
  }

  return {...createViewerContext(currentViewer), as: createViewerContext}
}
