import {readFileSync} from 'node:fs'
import {join} from 'node:path'

import {TRPCError} from '@trpc/server'
import {TRPC_ERROR_CODES_BY_NUMBER} from '@trpc/server/rpc'
import Mustache from 'mustache'
import {and, eq, schema} from '@openint/db'
import {env} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {orgProcedure, publicProcedure, router} from '../_base'
import {zConnectionId} from './utils/types'

const messageLanguage = z.enum(['javascript'])

const zMessageTemplateResponse = z.object({
  language: z.string(),
  template: z.string(),
})

const zConnectionCreatedResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  rendered: z.string(),
})

export const messagesRouter = router({
  messageTemplate: orgProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/ai/message_template',
        description: 'Get a message template for an AI agent',
        summary: 'Get Message Template',
      },
    })
    .input(
      z.object({
        language: messageLanguage.optional(),
        use_environment_variables: z.boolean().optional().default(false),
        customer_id: z.string(),
      }),
    )
    .output(zMessageTemplateResponse)
    .query(async ({input, ctx}) => {
      if (!env.AI_ROUTER_URL) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI API URL is not set',
        })
      }
      // Placeholder for the actual third-party API call
      const {language, use_environment_variables, customer_id} = input
      const apiUrl = new URL(env.AI_ROUTER_URL + '/v1/message_template')
      if (language) {
        apiUrl.searchParams.append('language', language)
      }
      apiUrl.searchParams.append(
        'use_environment_variables',
        String(use_environment_variables),
      )

      const customer = await ctx.db.query.customer.findFirst({
        where: and(
          eq(schema.customer.id, customer_id),
          eq(schema.customer.org_id, ctx.viewer.orgId),
        ),
      })
      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }
      apiUrl.searchParams.append('customer_id', customer_id)
      const response = await fetch(apiUrl.toString(), {
        headers: {
          Authorization: `Bearer ${customer?.api_key}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        // TODO: Consider more specific error handling based on status codes
        throw new TRPCError({
          code: TRPC_ERROR_CODES_BY_NUMBER[
            response.status as keyof typeof TRPC_ERROR_CODES_BY_NUMBER
          ],
          message: (await response.text()) || 'Server error',
        })
      }
      const data = await response.json()

      const validatedData = zMessageTemplateResponse.parse(data)
      return validatedData
    }),

  connectionCreated: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/ai/connection_created',
        description: 'Handle connection creation event',
        summary: 'Connection Created',
      },
    })
    .input(z.void())
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
        rendered: z.string(),
      }),
    )
    .mutation(async () => {
      // Read the GitHub example file
      const githubExamplePath = join(process.cwd(), '../../examples/github.ts')
      const githubExampleContent = readFileSync(githubExamplePath, 'utf-8')

      // Read and render the template
      const templatePath = join(
        process.cwd(),
        '../../packages/api-v1/templates/test.mustache',
      )
      const template = readFileSync(templatePath, 'utf-8')
      const rendered = Mustache.render(
        template,
        {task: githubExampleContent},
        {},
        {escape: (text) => String(text)},
      )

      return {
        success: true,
        message: 'Connection creation event handled successfully',
        rendered,
      }
    }),
})
