import type {CustomerId, Id, Viewer} from '@openint/cdk'
import type {AnyDatabase} from '@openint/db/db'

import {TRPCError} from '@trpc/server'
import {eq, schema} from '@openint/db'
import {envRequired} from '@openint/env'
import {makeJwtClient} from '../lib/makeJwtClient'

export async function viewerFromRequest(
  ctx: {db: AnyDatabase},
  req: Request,
): Promise<Viewer> {
  // Allow unauthenticated access to GET /v1/connection/{id} for specific orgs
  try {
    const url = new URL(req.url)
    const isGet = (req.method || 'GET').toUpperCase() === 'GET'
    const match = url.pathname.match(/^\/v1\/connection\/(conn_[^/]+)$/)
    if (isGet && match) {
      const connectionId = match[1] as string
      const whitelistedOrgIds = [
        'org_30tX19eKICtpokzSfMWDOiLU3KK',
        'org_31Kp0uFDyKhgnI7Agnus7RrDvlR',
      ] as const

      const conn = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, connectionId),
        columns: {connector_config_id: true},
      })
      if (conn?.connector_config_id) {
        const ccfg = await ctx.db.query.connector_config.findFirst({
          where: eq(schema.connector_config.id, conn.connector_config_id),
          columns: {org_id: true},
        })
        if (
          ccfg &&
          whitelistedOrgIds.includes(
            ccfg.org_id as (typeof whitelistedOrgIds)[number],
          )
        ) {
          return {role: 'org', orgId: ccfg.org_id as Id['org']}
        }
      }
    }
  } catch (_) {
    // Fallback to normal auth flow on URL parse or DB errors
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.match(/^Bearer (.+)/)?.[1]
  if (authHeader && !token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid Authorization header, expecting Bearer with token',
    })
  }

  // console.log('viewerFromRequest token', token)
  // JWT always include a dot. Without a dot we assume it's an API key
  if (token && !token.includes('.')) {
    // console.log('viewerFromRequest token is an API key')
    const tokenIsDoOld = token === process.env['DO_OLD_API_KEY']
    const org = tokenIsDoOld
      ? await ctx.db.query.organization.findFirst({
          where: eq(schema.organization.id, process.env['DO_ORG_ID'] + ''),
        })
      : await ctx.db.query.organization.findFirst({
          where: eq(schema.organization.api_key, token),
        })
    if (tokenIsDoOld) {
      console.warn(
        'Auth token is an old API key. This will be removed in the future.',
      )
    }
    if (org) {
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

    // Check if it's a customer API key
    const customer = await ctx.db.query.customer.findFirst({
      where: eq(schema.customer.api_key, token),
    })

    if (customer) {
      return {
        role: 'customer',
        orgId: customer.org_id as Id['org'],
        customerId: customer.id as CustomerId,
      }
    }

    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Invalid API key'})
  }

  try {
    const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
    const {viewer} = await jwt.verifyToken(token)
    return viewer
  } catch (err) {
    throw new TRPCError({code: 'UNAUTHORIZED', message: `${err}`})
  }
}
