import {TRPCError} from '@trpc/server'
import {dbUpsertOne, eq, inArray, schema} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {authenticatedProcedure, orgProcedure, router} from '../_base'
import {core} from '../../models'

const zOnboardingState = z.object({
  first_connector_configured: z.boolean(),
  first_connection_created: z.boolean(),
  api_key_used: z.boolean(),
  onboarding_marked_complete: z.boolean(),
})

export const organizationRouter = router({
  getOrganization: orgProcedure
    .meta({
      openapi: {method: 'GET', path: '/organization', enabled: false},
    })
    .input(z.void())
    .output(
      core.organization_select.extend({
        metadata: z.object({webhook_url: z.string().nullish()}),
      }),
    )
    .query(async ({ctx}) => {
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

      // create api key if not already
      if (!org.api_key) {
        console.log('Lazily creating api key for org', org.id)
        org.api_key = `key_${makeUlid()}`
        await dbUpsertOne(
          ctx.as({role: 'system'}).db, // TODO: Allow orgs to update their own api key
          schema.organization,
          {id: org.id, api_key: org.api_key},
          {insertOnlyColumns: ['api_key']},
        )
      }

      return {
        ...org,
        metadata: {
          webhook_url: org.metadata?.webhook_url ?? '',
        },
      }
    }),
  createOrganization: authenticatedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/organization/onboarding',
        enabled: false,
      },
    })
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        referrer: z.string().nullish(),
        clerkUserId: z.string(),
      }),
    )
    .output(z.object({id: z.string()}))
    .mutation(async ({input, ctx}) => {
      const apikey = `key_${makeUlid()}`
      const metadata = {
        referrer: input.referrer,
        clerk_user_id: input.clerkUserId,
      }
      const newOrg = {
        id: input.id,
        name: input.name,
        slug: input.name.toLowerCase().replace(/ /g, '-'),
        api_key: apikey,
        metadata,
      }

      await ctx
        .as({role: 'system'})
        .db.insert(schema.organization)
        .values(newOrg)

      return {id: input.id}
    }),
  getOnboarding: orgProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/organization/onboarding',
        enabled: false,
      },
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

  setOnboardingComplete: orgProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/organization/onboarding',
        enabled: false,
      },
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
  setWebhookUrl: orgProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/organization/webhook-url',
        enabled: false,
      },
    })
    .input(z.object({webhookUrl: z.string()}))
    .output(z.void())
    .mutation(async ({input, ctx}) => {
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

      if (org.metadata?.webhook_url === input.webhookUrl) {
        return
      }

      if (!input.webhookUrl.startsWith('https://')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid webhook URL. It must start with "https://".',
        })
      }

      // Consider doing this
      // const response = await fetch('/api/v1/organization/webhook-url', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({test: true, webhookUrl: input.webhookUrl}),
      // })

      // if (!response.ok) {
      //   throw new TRPCError({
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: 'Failed to send test POST request to the webhook URL.',
      //   })
      // }

      try {
        await ctx
          .as({role: 'system'})
          .db.update(schema.organization)
          .set({
            metadata: {
              ...org.metadata,
              webhook_url: input.webhookUrl,
            },
            updated_at: new Date().toISOString(),
          })
          .where(eq(schema.organization.id, org.id))
      } catch (error) {
        console.error('Error updating webhook URL:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook URL, please try again later',
        })
      }
    }),
})
