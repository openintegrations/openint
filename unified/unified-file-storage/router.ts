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
  const path = `/unified/file-storage${meta.path}` satisfies `/${string}`
  return {openapi: {...meta, path, tags: ['File Storage']}}
}

const procedure = verticalProcedure(adapters)

export const fileStorageRouter = trpc.router({
  listDrives: procedure
    .meta(oapi({method: 'GET', path: '/drive'}))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.Drive)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  getDrive: procedure
    .meta(oapi({method: 'GET', path: '/drive/{driveId}'}))
    .input(z.object({driveId: z.string()}))
    .output(unified.Drive)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listFolders: procedure
    .meta(oapi({method: 'GET', path: '/drive/{driveId}/folder'}))
    .input(zPaginationParams.extend({driveId: z.string()}))
    .output(zPaginatedResult.extend({items: z.array(unified.Folder)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  getFolder: procedure
    .meta(oapi({method: 'GET', path: '/drive/{driveId}/folder/{folderId}'}))
    .input(z.object({driveId: z.string(), folderId: z.string()}))
    .output(unified.Folder)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listFiles: procedure
    .meta(oapi({method: 'GET', path: '/drive/{driveId}/file'}))
    .input(zPaginationParams.extend({driveId: z.string(), folderId: z.string().nullish()}))
    .output(zPaginatedResult.extend({items: z.array(unified.File)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  getFile: procedure
    .meta(oapi({method: 'GET', path: '/drive/{driveId}/file/{fileId}'}))
    .input(z.object({driveId: z.string(), fileId: z.string()}))
    .output(unified.File)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type FileStorageAdapter<TInstance> = AdapterFromRouter<
  typeof fileStorageRouter,
  TInstance
>
