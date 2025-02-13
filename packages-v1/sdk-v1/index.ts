import {createTRPCClient, httpLink} from '@trpc/client'
import createClient, {wrapAsPathBasedClient} from 'openapi-fetch'
import type {AppRouter} from '@openint/api-v1'
import type {paths} from '@openint/api-v1/__generated__/openapi.types'

export const tprcClient = createTRPCClient<AppRouter>({
  links: [httpLink({url: '/api/trpc'})],
})

export const openapiClient = createClient<paths>({
  baseUrl: '/api/v1',
})

export const pathBasedClient = wrapAsPathBasedClient(openapiClient)
