// not sure about directly depending on vdk from api, but anyways
import type {
  ZodOpenApiComponentsObject,
  ZodOpenApiPathsObject,
} from '@lilyrose2798/trpc-openapi/dist/generator'
import {generateOpenApiDocument} from '@lilyrose2798/trpc-openapi/dist/generator'
import {getServerUrl} from '@openint/app-config/constants'
import {flatRouter, outgoingWebhookEventMap} from '@openint/engine-backend'
import {env} from '@openint/env'
import accountingRouter from '@openint/unified-accounting'
import atsRouter from '@openint/unified-ats'
import bankingRouter from '@openint/unified-banking'
import {crmRouter} from '@openint/unified-crm'
import eltRouter from '@openint/unified-etl'
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
  etl: eltRouter,
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
      mapValues(eMap, (shape, name): Schemas[string] =>
        z.object({...shape, name: z.literal(name), id: z.string().optional()}),
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

  let oas = generateOpenApiDocument(appRouter, {
    openApiVersion: '3.1.0', // Want jsonschema
    title: 'OpenInt OpenAPI',
    version: '0.0.0',
    securitySchemes: {
      apikey: {
        type: 'apiKey',
        name: 'x-apikey',
        in: 'header',
      },
      resourceId: {
        type: 'apiKey',
        name: 'x-resource-id',
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
  oas.security = [{apikey: [], resourceId: []}]
  return oas
}

function removeInternalPaths(oas: any): any {
  // Filter out paths with the tag "Internal"
  const paths = oas.paths;
  const filteredPaths = Object.fromEntries(
    Object.entries(paths).filter(([_, operations]) =>
      !Object.values(operations as Record<string, any>).some((operation: any) =>
        operation.tags?.includes('Internal') || operation.tags?.includes('Connectors'),
      )
    )
  );

  // Return the updated OAS object with filtered paths
  return {
    ...oas,
    paths: filteredPaths
  };
}

if (require.main === module) {
  console.log(JSON.stringify(getOpenAPISpec(), null, 2))
}
