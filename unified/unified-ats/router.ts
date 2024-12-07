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
export type Unified = {
  [k in keyof typeof unified]: z.infer<(typeof unified)[k]>
}

function oapi(meta: NonNullable<RouterMeta['openapi']>): RouterMeta {
  const path = `/unified/ats${meta.path}` satisfies `/${string}`
  return {openapi: {summary: path, ...meta, path}}
}

const procedure = verticalProcedure(adapters)

const tags = ['ATS']

export const atsRouter = trpc.router({
  listJobs: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/job',
        tags,
        summary: 'List Jobs',
      }),
    )
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.job)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listJobOpenings: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/job/{jobId}/opening',
        tags,
        summary: 'List Job Openings',
      }),
    )
    .input(
      z.object({jobId: z.string()}).extend(zPaginationParams.shape).nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.opening)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listOffers: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/offer',
        tags,
        summary: 'List Offers',
      }),
    )
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.offer)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listCandidates: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/candidate',
        tags,
        summary: 'List Candidates',
      }),
    )
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.candidate)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listDepartments: procedure
    .meta(
      oapi({
        method: 'GET',
        path: '/department',
        tags,
        summary: 'List Departments',
      }),
    )
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.department)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type ATSAdapter<TInstance> = AdapterFromRouter<
  typeof atsRouter,
  TInstance
>
