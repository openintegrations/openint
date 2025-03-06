import {TRPCError} from '@trpc/server'
import type {Id, Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import type {AnyDatabase} from '@openint/db/db'
import {envRequired} from '@openint/env'
import type {RouterContext, ViewerContext} from './_base'

const jwt = makeJwtClient({
  secretOrPublicKey: envRequired.JWT_SECRET,
})

export async function viewerFromRequest(
  ctx: {db: AnyDatabase},
  req: Request,
): Promise<Viewer> {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)/)?.[1]
  // JWT always include a dot. Without a dot we assume it's an API key
  if (token && !token.includes('.')) {
    const org = await ctx.db.query.organization.findFirst({
      columns: {id: true},
      where: eq(schema.organization.api_key, token),
    })
    if (!org) {
      throw new TRPCError({code: 'UNAUTHORIZED', message: 'Invalid API key'})
    }
    return {role: 'org', orgId: org.id as Id['org']}
  }
  return jwt.verifyViewer(token)
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
