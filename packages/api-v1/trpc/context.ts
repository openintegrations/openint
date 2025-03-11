import type {Viewer} from '@openint/cdk'
import type {AnyDatabase, AnyDrizzle} from '@openint/db/db'
import {viewerFromRequest} from './authentication'

export interface ViewerContext<T extends Viewer = Viewer> {
  viewer: T
  db: AnyDrizzle
}

export interface RouterContext<T extends Viewer = Viewer>
  extends ViewerContext<T> {
  as: (viewer: Viewer) => ViewerContext
}

export async function routerContextFromRequest({
  req,
  ...ctx
}: {req: Request} & Omit<CreateRouterContextOptions, 'viewer'>) {
  return routerContextFromViewer({
    ...ctx,
    viewer: await viewerFromRequest(ctx, req),
  })
}

interface CreateRouterContextOptions<T extends Viewer = Viewer> {
  viewer: T
  db: AnyDatabase
}

export function routerContextFromViewer<T extends Viewer>({
  viewer: currentViewer,
  db,
}: CreateRouterContextOptions<T>): RouterContext<T> {
  function createViewerContext<T2 extends Viewer>(
    viewer: T2,
  ): ViewerContext<T2> {
    const dbForViewer = db.$asViewer?.(viewer)
    if (!dbForViewer) {
      throw new Error(`${db.driverType} does not support asViewer`)
    }
    return {viewer, db: dbForViewer}
  }

  return {
    ...createViewerContext(currentViewer),
    as: createViewerContext,
  }
}
