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
  return {openapi: {...meta, path: `/unified/sync${meta.path}`}}
}

const procedure = verticalProcedure(adapters)

const tags = ['Sync']

export const syncRouter = trpc.router({
  readStream: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/read/{stream}',
        tags,
        summary: 'Read Stream',
      }),
    )
    .input(
      zPaginationParams.extend({
        stream: z.string(),
        fields: z.array(z.string()).optional(),
      }),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.record_data)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  discover: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/discover',
        tags,
        summary: 'Discover',
      }),
    )
    .input(z.void())
    .output(unified.message_catalog)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  read: procedure
    .meta(
      oapi({
        method: 'POST',
        path: '/read',
        tags,
        summary: 'Read Data',
      }),
    )
    .input(
      z.object({
        catalog: unified.configured_catalog,
        state: unified.global_state,
      }),
    )
    .output(z.array(unified.message_record))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  write: procedure
    .meta(
      oapi({
        method: 'POST',
        path: '/write',
        tags,
        summary: 'Write Data',
      }),
    )
    .input(z.object({messages: z.array(unified.message_record)}))
    .output(z.array(unified.message))
    .mutation(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type Adapter<TInstance> = AdapterFromRouter<typeof syncRouter, TInstance>
