import type {AdapterFromRouter, RouterMeta} from '@openint/vdk'
import {
  proxyCallAdapter,
  trpc,
  verticalProcedure,
  z,
  zPaginatedResult,
  zPaginationParams,
} from '@openint/vdk'
import adapters from './adapters'
import * as unified from './unifiedModels'

export {unified}

function oapi(meta: NonNullable<RouterMeta['openapi']>): RouterMeta {
  return {openapi: {...meta, path: `/unified/hris${meta.path}`}}
}

const procedure = verticalProcedure(adapters)

const tags = ['HRIS']

export const hrisRouter = trpc.router({
  listIndividual: procedure
    .meta(oapi({
      method: 'GET',
      path: '/individual',
      tags,
      summary: 'List Individuals',
    }))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.individual)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type HrisAdapter<TInstance> = AdapterFromRouter<
  typeof hrisRouter,
  TInstance
>
