import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {encodeApiKey} from '@openint/cdk'
import {eq, inArray, schema} from '@openint/db'
import {makeUlid} from '@openint/util'
import {getOauthRedirectUri} from '../../../connectors/cnext/_defaults/oauth2/utils'
import {core} from '../models'
import {orgProcedure, router} from '../trpc/_base'

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
      core.organization.extend({
        metadata: z.object({
          webhook_url: z.string().nullish(),
          oauth_redirect_url: z.string().nullish(),
        }),
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

      return {
        ...org,
        metadata: {
          webhook_url: org.metadata?.webhook_url ?? '',
          oauth_redirect_url:
            org.metadata?.oauth_redirect_url ??
            await getOauthRedirectUri(ctx.viewer.orgId, org),
        },
      }
    }),
  createOrganization: orgProcedure
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
      const apikey = encodeApiKey(input.id, `key_${makeUlid()}`)
      const metadata = {
        referrer: input.referrer,
        clerk_user_id: input.clerkUserId,
      }
      const newOrg = {
        id: input.id,
        name: input.name,
        slug: input.name.toLowerCase().replace(/ /g, '-'),
        api_key: apikey as string,
        metadata,
      }

      await ctx.db.insert(schema.organization).values(newOrg)

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
  setMetadataUrl: orgProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/organization/metadata-url',
        enabled: false,
      },
    })
    .input(
      z.object({
        urlType: z.enum(['webhook_url', 'oauth_redirect_url']),
        url: z.string(),
      }),
    )
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

      // Check if the URL is already set to the same value
      if (org.metadata?.[input.urlType] === input.url) {
        return
      }

      // Validate URL based on type
      if (
        input.urlType === 'webhook_url' &&
        !input.url.startsWith('https://')
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid webhook URL. It must start with "https://".',
        })
      }

      // For OAuth redirect URLs, ensure they are valid URLs
      if (input.urlType === 'oauth_redirect_url') {
        try {
          new URL(input.url)
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid OAuth redirect URL. Please provide a valid URL.',
          })
        }
      }

      try {
        await ctx
          .as({role: 'system'})
          .db.update(schema.organization)
          .set({
            metadata: {
              ...org.metadata,
              [input.urlType]: input.url,
            },
            updated_at: new Date().toISOString(),
          })
          .where(eq(schema.organization.id, org.id))
      } catch (error) {
        console.error(`Error updating ${input.urlType}:`, error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update ${input.urlType.replace(/_/g, ' ')}, please try again later`,
        })
      }
    }),
})
