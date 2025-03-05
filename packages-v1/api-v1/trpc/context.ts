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
  // API Key here
  if (token?.startsWith('key_')) {
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
