import {TRPCError} from '@trpc/server'
import {TRPC_ERROR_CODES_BY_NUMBER} from '@trpc/server/rpc'
import {env} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {orgProcedure, router} from '../_base'

const messageLanguage = z.enum(['javascript'])

const zMessageTemplateResponse = z.object({
  language: z.string(),
  template: z.string(),
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
    .query(async ({input}) => {
      if (!env.AI_ROUTER_URL) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI API URL is not set',
        })
      }
      // Placeholder for the actual third-party API call
      const {language, use_environment_variables, customer_id} = input
      const apiUrl = new URL(env.AI_ROUTER_URL)
      if (language) {
        apiUrl.searchParams.append('language', language)
      }
      apiUrl.searchParams.append(
        'use_environment_variables',
        String(use_environment_variables),
      )
      apiUrl.searchParams.append('customer_id', customer_id)

      const response = await fetch(apiUrl.toString())
      if (!response.ok) {
        // Consider more specific error handling based on status codes
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
})
