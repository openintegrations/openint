import {z} from 'zod'
import {makeJwtClient} from '@openint/cdk'
import {publicProcedure, router} from '../_base'
import {getServerUrl} from '../../../../apps/app-config/constants'

export const connectRouter = router({
  createMagicLink: publicProcedure
    .meta({
      openapi: {method: 'POST', path: '/connect/magic-link'},
    })
    .input(
      z.object({
        email: z.string().email(),
        customer_id: z
          .string()
          .min(1)
          .describe(
            'Anything that uniquely identifies the customer that you will be sending the magic link to',
          ),
        validity_in_seconds: z
          .number()
          .optional()
          .default(2592000)
          .describe(
            'How long the magic link will be valid for (in seconds) before it expires',
          ),
        redirect_url: z
          .string()
          .nullable()
          .optional()
          .describe(
            'Where to send user to after connect / if they press back button',
          ),
        connector_names: z
          .string()
          .nullable()
          .optional()
          .describe('Filter integrations by comma separated connector names'),
        integration_ids: z
          .string()
          .nullable()
          .optional()
          .describe('Filter integrations by comma separated integration ids'),
        connection_id: z
          .string()
          .nullable()
          .optional()
          .describe('Filter managed connections by connection id'),
        theme: z
          .enum(['light', 'dark'])
          .nullable()
          .optional()
          .describe('Magic Link display theme'),
        view: z
          .enum(['manage', 'manage-deeplink', 'add', 'add-deeplink'])
          .nullable()
          .optional()
          .describe('Magic Link tab view'),
      }),
    )
    .output(z.object({url: z.string()}))
    .mutation(async ({ctx, input}) => {
      // TODO: replace with new signing and persisting mechanism
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })
      const token = jwt.signViewer(ctx.viewer, {
        validityInSeconds: input.validity_in_seconds,
      })

      const url = new URL('/connect/portal', getServerUrl(null))
      url.searchParams.set('token', token)

      if (input.redirect_url) {
        url.searchParams.set('redirectUrl', input.redirect_url)
      }

      if (input.connector_names) {
        const connectorNames = input.connector_names
          .split(',')
          .map((name) => name.trim())
        url.searchParams.set('connectorNames', connectorNames.join(','))
      }

      if (input.integration_ids) {
        const integrationIds = input.integration_ids.split(',').map((id) => {
          const trimmedId = id.trim()
          // Add int_ prefix if needed
          return trimmedId.includes('_') &&
            trimmedId.split('_').length === 2 &&
            !trimmedId.startsWith('int_')
            ? `int_${trimmedId}`
            : trimmedId
        })
        url.searchParams.set('integrationIds', integrationIds.join(','))
      }

      if (input.connection_id) {
        url.searchParams.set('connectionId', input.connection_id)
      }

      if (input.theme) {
        url.searchParams.set('theme', input.theme)
      }

      if (input.view) {
        url.searchParams.set('view', input.view)
      }

      return {
        url: url.toString(),
      }
    }),
  createToken: publicProcedure
    .meta({
      openapi: {method: 'POST', path: '/connect/token'},
    })
    .input(
      z.object({
        customer_id: z
          .string()
          .min(1)
          .describe(
            'Anything that uniquely identifies the customer that you will be sending the token to',
          ),
        validity_in_seconds: z
          .number()
          .optional()
          .default(2592000)
          .describe(
            'How long the token will be valid for (in seconds) before it expires',
          ),
      }),
    )
    .output(z.object({token: z.string()}))
    .mutation(async ({ctx, input}) => {
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })

      const token = jwt.signViewer(ctx.viewer, {
        validityInSeconds: input.validity_in_seconds,
      })

      return {
        token: token,
      }
    }),
})
