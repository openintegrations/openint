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
  return {openapi: {...meta, path: `/unified/file-storage${meta.path}`}}
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
    .meta(oapi({method: 'GET', path: '/folder'}))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.Folder)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  getFolder: procedure
    .meta(oapi({method: 'GET', path: '/folder/{folderId}'}))
    .input(z.object({folderId: z.string()}))
    .output(unified.Folder)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  listFiles: procedure
    .meta(oapi({method: 'GET', path: '/file'}))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.File)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
  getFile: procedure
    .meta(oapi({method: 'GET', path: '/file/{fileId}'}))
    .input(z.object({fileId: z.string()}))
    .output(unified.File)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),
})

export type FileStorageAdapter<TInstance> = AdapterFromRouter<
  typeof fileStorageRouter,
  TInstance
>
