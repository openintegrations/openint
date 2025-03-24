import {type GreenhouseSDK} from '@openint/connector-greenhouse'
import {applyMapper} from '@openint/vdk'
import type {ATSAdapter} from '../../router'
import {mappers} from './mappers'

export const greenhouseAdapter = {
  listJobs: async ({instance, input}) => {
    const page = input?.cursor ? Number(input?.cursor) : 1

    const res = await instance.GET('/v1/jobs', {
      params: {query: {per_page: input?.page_size, page: page}},
    })

    let nextPage = undefined
    if (input?.page_size && res.data?.length === input?.page_size) {
      nextPage = page + 1
    }

    return {
      has_next_page: !!nextPage,
      next_cursor: nextPage ? String(nextPage) : undefined,
      items: res.data?.map((d) => applyMapper(mappers.job, d)) ?? [],
    }
  },
  listJobOpenings: async ({instance, input}) => {
    const page = input?.cursor ? Number(input?.cursor) : 1
    const jobId = input?.jobId
    if (!jobId) {
      throw new Error('jobId is required')
    }
    const res = await instance.GET('/v1/jobs/{id}/openings', {
      params: {
        query: {per_page: input?.page_size, page: page},
        path: {id: jobId},
      },
    })
    let nextPage = undefined
    if (input?.page_size && res.data?.length === input?.page_size) {
      nextPage = page + 1
    }
    return {
      has_next_page: !!nextPage,
      next_cursor: nextPage ? String(nextPage) : undefined,
      items:
        res.data?.map((d) =>
          applyMapper(mappers.opening, {job_id: jobId, ...d}),
        ) ?? [],
    }
  },
  listOffers: async ({instance, input}) => {
    const page = input?.cursor ? Number(input?.cursor) : 1
    const res = await instance.GET('/v1/offers', {
      params: {query: {per_page: input?.page_size, page: page}},
    })
    let nextPage = undefined
    if (input?.page_size && res.data?.length === input?.page_size) {
      nextPage = page + 1
    }
    return {
      has_next_page: !!nextPage,
      next_cursor: nextPage ? String(nextPage) : undefined,
      items: res.data?.map((d) => applyMapper(mappers.offer, d)) ?? [],
    }
  },
  listCandidates: async ({instance, input}) => {
    const page = input?.cursor ? Number(input?.cursor) : 1
    const res = await instance.GET('/v1/candidates', {
      params: {query: {per_page: input?.page_size, page: page}},
    })
    let nextPage = undefined
    if (input?.page_size && res.data?.length === input?.page_size) {
      nextPage = page + 1
    }
    return {
      has_next_page: !!nextPage,
      next_cursor: nextPage ? String(nextPage) : undefined,
      items: res.data?.map((d) => applyMapper(mappers.candidate, d)) ?? [],
    }
  },
  listDepartments: async ({instance, input}) => {
    const page = input?.cursor ? Number(input?.cursor) : 1
    const res = await instance.GET('/v1/departments', {
      params: {query: {per_page: input?.page_size, page: page}},
    })
    let nextPage = undefined
    if (input?.page_size && res.data?.length === input?.page_size) {
      nextPage = page + 1
    }
    return {
      has_next_page: !!nextPage,
      next_cursor: nextPage ? String(nextPage) : undefined,
      items: res.data?.map((d) => applyMapper(mappers.department, d)) ?? [],
    }
  },
} satisfies ATSAdapter<GreenhouseSDK>
