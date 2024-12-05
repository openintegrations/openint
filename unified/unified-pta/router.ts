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
  return {openapi: {...meta, path: `/unified/pta${meta.path}`}}
}

const procedure = verticalProcedure(adapters)

const tags = ['PTA']

export const ptaRouter = trpc.router({
  // MARK: - Account
  listAccounts: procedure
    .meta(oapi({
      method: 'GET',
      path: '/account',
      tags,
      summary: 'List Accounts',
    }))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.account)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  
  listTransactions: procedure
    .meta(oapi({
      method: 'GET',
      path: '/transaction',
      tags,
      summary: 'List Transactions',
    }))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.transaction)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  
  listCommodities: procedure
    .meta(oapi({
      method: 'GET',
      path: '/commodity',
      tags,
      summary: 'List Commodities',
    }))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.commodity)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type PtaAdapter<TInstance> = AdapterFromRouter<
  typeof ptaRouter,
  TInstance
>
