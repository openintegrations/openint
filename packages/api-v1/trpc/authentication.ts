import type {Id, Viewer} from '@openint/cdk'
import type {AnyDatabase} from '@openint/db/db'
import {TRPCError} from '@trpc/server'
import {eq, schema} from '@openint/db'
import {envRequired} from '@openint/env'
import {makeJwtClient} from '../lib/makeJwtClient'

export async function viewerFromRequest(
  ctx: {db: AnyDatabase},
  req: Request,
): Promise<Viewer> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.match(/^Bearer (.+)/)?.[1]
  if (authHeader && !token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid Authorization header, expecting Bearer with token',
    })
  }

  // JWT always include a dot. Without a dot we assume it's an API key
  if (token && !token.includes('.')) {
    const org = await ctx.db.query.organization.findFirst({
      where: eq(schema.organization.api_key, token),
    })
    if (!org) {
      throw new TRPCError({code: 'UNAUTHORIZED', message: 'Invalid API key'})
    }
    if (!org?.metadata?.api_key_used) {
      await ctx.db.update(schema.organization).set({
        metadata: {
          ...org.metadata,
          api_key_used: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
    }

    return {role: 'org', orgId: org.id as Id['org']}
  }

  try {
    const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
    const {viewer} = await jwt.verifyToken(token)
    return viewer
  } catch (err) {
    throw new TRPCError({code: 'UNAUTHORIZED', message: `${err}`})
  }
}
