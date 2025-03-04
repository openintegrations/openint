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
    .meta(oapi({method: 'GET', path: '/drive-group'}))
    .input(zPaginationParams.nullish())
    .output(zPaginatedResult.extend({items: z.array(unified.DriveGroup)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listDrives: procedure
    .meta(oapi({method: 'GET', path: '/drive'}))
    .input(
      zPaginationParams
        .extend({
          drive_group_id: z.string().optional(),
        })
        .nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.Drive)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listFiles: procedure
    .meta(oapi({method: 'GET', path: '/file'}))
    .input(
      zPaginationParams
        .extend({
          drive_id: z.string().optional(),
          folder_id: z.string().optional(),
          drive_group_id: z.string().optional(),
        })
        .nullish(),
    )
    .output(zPaginatedResult.extend({items: z.array(unified.File)}))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  getFile: procedure
    .meta(oapi({method: 'GET', path: '/file/{id}'}))
    .input(
      z.object({
        id: z.string(),
        drive_id: z.string().optional(),
      }),
    )
    .output(unified.File)
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  exportFile: procedure
    .meta(oapi({method: 'GET', path: '/file/{id}/export'}))
    .input(
      z.object({
        id: z.string(),
        format: z.string(),
        drive_id: z.string().optional(),
      }),
    )
    .output(z.instanceof(ReadableStream))
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  downloadFile: procedure
    .meta(oapi({method: 'GET', path: '/file/{id}/download'}))
    .input(
      z.object({
        id: z.string(),
        drive_id: z.string().optional(),
      }),
    )
    .output(z.instanceof(ReadableStream)) // don't validate output
    .query(async ({input, ctx}) => proxyCallAdapter({input, ctx})),

  listFolders: procedure
    .meta(oapi({method: 'GET', path: '/folder'}))
    .input(
      zPaginationParams
        .extend({
          drive_id: z.string().optional(),
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
