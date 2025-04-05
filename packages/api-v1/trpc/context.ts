import {asOrgIfCustomer, type Viewer} from '@openint/cdk'
import type {AnyDatabase, AnyDrizzle} from '@openint/db/db'
import {viewerFromRequest} from './authentication'

export interface ViewerContext<T extends Viewer = Viewer> {
  viewer: T
  db: AnyDrizzle
}

interface RouterContextExtra {
  /** Custom fetch, typically for testing purposes */
  fetch?: (req: Request) => Promise<Response>
}

export interface RouterContext<T extends Viewer = Viewer>
  extends ViewerContext<T>,
    RouterContextExtra {
  as: (viewer: Viewer) => ViewerContext
  /** Elevates the role to org if the viewer is a customer to allow access to org data */
  asOrgIfCustomer: ViewerContext
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

interface CreateRouterContextOptions<T extends Viewer = Viewer>
  extends RouterContextExtra {
  viewer: T
  db: AnyDatabase
}

export function routerContextFromViewer<T extends Viewer>({
  viewer: currentViewer,
  db,
  ...extra
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
    ...extra,
    ...createViewerContext(currentViewer),
    as: createViewerContext,
    asOrgIfCustomer: createViewerContext(asOrgIfCustomer(currentViewer)),
  }
}
