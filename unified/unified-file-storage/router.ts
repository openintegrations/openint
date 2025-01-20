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

function oapi(meta: NonNullable<RouterMeta['openapi']>): RouterMeta {
  const path = `/unified/file-storage${meta.path}` satisfies `/${string}`
  return {openapi: {...meta, path, tags: ['File Storage']}}
}

const procedure = verticalProcedure(adapters)

export const fileStorageRouter = trpc.router({
  listDriveGroups: procedure
    .meta(oapi({method: 'GET', path: '/drive-groups'}))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.DriveGroup)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listDrives: procedure
    .meta(oapi({method: 'GET', path: '/drives'}))
    .input(
      zPaginationParams
        .extend({
          driveGroupId: z.string().optional(),
        })
        .nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.Drive)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listFiles: procedure
    .meta(oapi({method: 'GET', path: '/files'}))
    .input(
      zPaginationParams
        .extend({
          driveId: z.string().optional(),
          folderId: z.string().optional(),
        })
        .nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.File)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  getFile: procedure
    .meta(oapi({method: 'GET', path: '/files/{id}'}))
    .input(z.object({id: z.string()}))
    .output(unified.File)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  exportFile: procedure
    .meta(oapi({method: 'GET', path: '/files/{id}/export'}))
    .input(
      z.object({
        id: z.string(),
        format: z.string(),
      }),
    )
    .output(z.instanceof(ReadableStream))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  downloadFile: procedure
    .meta(oapi({method: 'GET', path: '/files/{id}/download'}))
    .input(z.object({id: z.string()}))
    .output(z.instanceof(ReadableStream))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listFolders: procedure
    .meta(oapi({method: 'GET', path: '/folders'}))
    .input(
      zPaginationParams
        .extend({
          driveId: z.string().optional(),
        })
        .nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.Folder)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type FileStorageAdapter<TInstance> = AdapterFromRouter<
  typeof fileStorageRouter,
  TInstance
>
