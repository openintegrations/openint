// not sure about directly depending on vdk from api, but anyways
import type {
  ZodOpenApiComponentsObject,
  ZodOpenApiPathsObject,
} from '@lilyrose2798/trpc-openapi/dist/generator'
import {generateOpenApiDocument} from '@lilyrose2798/trpc-openapi/dist/generator'
import {getServerUrl} from '@openint/app-config/constants'
import {flatRouter} from '@openint/engine-backend'
import {env} from '@openint/env'
import {outgoingWebhookEventMap} from '@openint/events'
import accountingRouter from '@openint/unified-accounting'
import atsRouter from '@openint/unified-ats'
import bankingRouter from '@openint/unified-banking'
import {crmRouter} from '@openint/unified-crm'
import fileStorageRouter from '@openint/unified-file-storage'
import hrisRouter from '@openint/unified-hris'
import ptaRouter from '@openint/unified-pta'
import {salesEngagementRouter} from '@openint/unified-sales-engagement'
import {sentenceCase} from '@openint/util'
import type {AnyRouter, RouterMeta} from '@openint/vdk'
import {mapKeys, mapValues, publicProcedure, trpc, z} from '@openint/vdk'
import {authRouter} from './authRouter'

export const publicRouter = trpc.router({
  getOpenapiDocument: publicProcedure
    .meta({openapi: {method: 'GET', path: '/openapi.json', tags: ['Internal']}})
    .input(z.void())
    .output(z.unknown())
    .query((): unknown => getOpenAPISpec()),
})

export const _appRouter = trpc.router({
  public: publicRouter,
  // Verticals
  salesEngagement: salesEngagementRouter,
  crm: crmRouter,
  banking: bankingRouter,
  accounting: accountingRouter,
  pta: ptaRouter,
  ats: atsRouter,
  hris: hrisRouter,
  fileStorage: fileStorageRouter,
})

export const appRouter = trpc.mergeRouters(flatRouter, authRouter, _appRouter)
setDefaultOpenAPIMeta(appRouter)

export type AppRouter = typeof appRouter

function assertNoSlash(name: string) {
  if (name.includes('/')) {
    throw new Error(`Event name ${name} containing '/' is not supported`)
  }
  return name
}

export function oasWebhooksEventsMap(
  eMap: Record<string, {data: z.AnyZodObject}>,
) {
  const webhooks = mapValues(
    eMap,
    (_, name): ZodOpenApiPathsObject[string] => ({
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/webhooks.${assertNoSlash(name)}`,
              },
            },
          },
        },
        responses: {},
      },
    }),
  )
  type Schemas = NonNullable<ZodOpenApiComponentsObject['schemas']>
  const components = {
    schemas: mapKeys(
      mapValues(
        eMap,
        (shape, name) =>
          // Not sure why this is erroring, we should probably fix everywhere
          z.object({
            ...shape,
            name: z.literal(name),
            id: z.string().optional(),
          }) as unknown as Schemas[string],
      ),
      (name) => `webhooks.${name}`,
    ),
  }
  return {webhooks, components}
}

/**
 * Use the last segment of the operationId to be the default openapi summary
 * e.g. `crm.getContact` -> `Get Contact`
 */
function setDefaultOpenAPIMeta(router: AnyRouter) {
  for (const procedureMap of [router._def.queries, router._def.mutations]) {
    for (const [name, procedure] of Object.entries(
      procedureMap as Record<string, unknown>,
    )) {
      const meta = (procedure as {meta?: RouterMeta} | undefined)?.meta
      // console.log('Adding openapi for', name)
      if (meta?.openapi && !meta.openapi.summary) {
        const summary = sentenceCase(name.split('.').pop() ?? '')
        meta.openapi.summary = summary
        // console.log('Will add summary for', name, meta.openapi)
      }
    }
  }
}

export function getOpenAPISpec(includeInternal = true) {
  const {webhooks, components} = oasWebhooksEventsMap(outgoingWebhookEventMap)

  let oas = generateOpenApiDocument(appRouter as any, {
    openApiVersion: '3.1.0', // Want jsonschema
    title: 'OpenInt OpenAPI',
    version: '0.0.0',
    securitySchemes: {
      apikey: {
        type: 'apiKey',
        name: 'x-apikey',
        in: 'header',
      },
      connectionId: {
        type: 'apiKey',
        name: 'x-connection-id',
        in: 'header',
      },
      // TODO: Should this be an actual oauth thing? Doesn't seem to work as is right now
      token: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
    baseUrl: env.NEXT_PUBLIC_API_URL ?? getServerUrl(null) + '/api/v0',
    webhooks,
    components,
  })

  if (!includeInternal) {
    oas = removeInternalPaths(oas)
  }

  // Unfortunately trpc-openapi is missing bunch of options...
  oas.security = [{apikey: [], connectionId: []}]
  return oas
}

function removeInternalPaths(oas: any): any {
  const paths = oas.paths

  // hardcoded tags for enforcing consistency in docs
  const whitelistedTags = [
    'Connect',
    'Core',
    'Sales Engagement',
    'CRM',
    'Banking',
    'Accounting',
    'PTA',
    'ATS',
    'HRIS',
    'File Storage',
  ]

  const internalTags = ['Internal', 'Connectors', 'ETL', 'Sync']

  const filteredPaths = Object.fromEntries(
    Object.entries(paths).filter(([path, operations]) => {
      const operationValues = Object.values(operations as Record<string, any>)

      // Validate all tags are recognized
      operationValues.forEach((operation: any) => {
        operation.tags?.forEach((tag: string) => {
          if (!whitelistedTags.includes(tag) && !internalTags.includes(tag)) {
            throw new Error(
              `Unrecognized tag "${tag}" found in path "${path}". All tags must be whitelisted in the 'removeInternalPaths' function.`,
            )
          }
        })
      })

      // Keep paths that have whitelisted tags
      const hasWhitelistedTag = operationValues.some(
        (operation: any) =>
          operation.tags?.some((tag: string) => whitelistedTags.includes(tag)),
      )

      // Filter out internal paths unless they have a whitelisted tag
      const hasInternalTag = operationValues.some(
        (operation: any) =>
          operation.tags?.some((tag: string) => internalTags.includes(tag)),
      )

      return hasWhitelistedTag || !hasInternalTag
    }),
  )

  return {
    ...oas,
    paths: filteredPaths,
  }
}

if (require.main === module) {
  console.log(JSON.stringify(getOpenAPISpec(), null, 2))
}
