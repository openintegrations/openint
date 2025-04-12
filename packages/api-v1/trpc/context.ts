import type {Viewer} from '@openint/cdk'
import type {AnyDatabase, AnyDrizzle} from '@openint/db/db'
import type {RouterContextOnError} from './error-handling'

import {asOrgIfCustomer, resolveViewer} from '@openint/cdk'
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
    RouterContextExtra,
    RouterContextOnError {
  as: (viewer: Viewer) => ViewerContext
  /** Elevates the role to org if the viewer is a customer to allow access to org data */
  asOrgIfCustomer: ViewerContext
}

// MARK: - createRouterContext
interface CreateRouterContextOptions extends RouterContextExtra {
  db: AnyDatabase
}

export async function routerContextFromRequest({
  req,
  getAdditionalViewer,
  ...ctx
}: CreateRouterContextOptions & {
  req: Request
  /** Additional viewer to use for the request not part of the authorization header */
  getAdditionalViewer?: () => Promise<Viewer>
}) {
  return routerContextFromViewer({
    ...ctx,
    viewer: resolveViewer([
      await viewerFromRequest(ctx, req),
      await getAdditionalViewer?.(),
    ]),
  })
}

export function routerContextFromViewer<T extends Viewer>({
  viewer: currentViewer,
  db,
  ...extra
}: CreateRouterContextOptions & {viewer: T}): RouterContext<T> {
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
