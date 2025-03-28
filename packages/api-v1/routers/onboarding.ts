import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {eq, inArray, schema} from '@openint/db'
import {publicProcedure, router} from '../trpc/_base'

const zOnboardingState = z.object({
  first_connector_configured: z.boolean(),
  first_connection_created: z.boolean(),
  api_key_used: z.boolean(),
  onboarding_marked_complete: z.boolean(),
})

export const onboardingRouter = router({
  getOnboarding: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/organization/onboarding'},
    })
    .input(z.void())
    .output(zOnboardingState)
    .query(async ({ctx}) => {
      if (!ctx.viewer.orgId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization not found',
        })
      }

      const org = await ctx
        .as({role: 'system'})
        .db.query.organization.findFirst({
          where: eq(schema.organization.id, ctx.viewer.orgId),
        })

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      const connectorConfigs = await ctx
        .as({role: 'system'})
        .db.query.connector_config.findMany({
          where: eq(schema.connector_config.org_id, org.id),
        })

      const firstConnectionCreated =
        connectorConfigs.length > 0 &&
        (await ctx.as({role: 'system'}).db.query.connection.findFirst({
          where:
            connectorConfigs.length > 0
              ? inArray(
                  schema.connection.connector_config_id,
                  connectorConfigs.map((config) => config.id),
                )
              : undefined,
        }))

      return {
        first_connector_configured: connectorConfigs.length > 0,
        first_connection_created: !!firstConnectionCreated,
        api_key_used: !!org?.metadata?.api_key_used,
        onboarding_marked_complete: !!org?.metadata?.onboarding_marked_complete,
      }
    }),

  setOnboardingComplete: publicProcedure
    .meta({
      openapi: {method: 'PUT', path: '/organization/onboarding'},
    })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ctx}) => {
      if (!ctx.viewer.orgId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization not found',
        })
      }

      const org = await ctx
        .as({role: 'system'})
        .db.query.organization.findFirst({
          where: eq(schema.organization.id, ctx.viewer.orgId),
        })

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        })
      }

      if (org?.metadata?.onboarding_marked_complete) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Onboarding already marked complete',
        })
      }

      await ctx
        .as({role: 'system'})
        .db.update(schema.organization)
        .set({
          metadata: {
            ...org.metadata,
            onboarding_marked_complete: true,
          },
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.organization.id, org.id))
    }),
})
