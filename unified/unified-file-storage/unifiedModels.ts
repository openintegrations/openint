import {z} from '@openint/vdk'

export const DriveGroup = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    updated_at: z.string().nullish(),
    created_at: z.string().nullish(),
    raw_data: z.any(),
  })
  .openapi({
    ref: 'unified.drivegroup',
    description: 'A unified representation of a drive group',
  })

export const Drive = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    updated_at: z.string().nullish(),
    created_at: z.string().nullish(),
    raw_data: z.any(),
  })
  .openapi({
    ref: 'unified.drive',
    description: 'A unified representation of a storage drive',
  })

export const File = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    description: z.string().nullish(),
    type: z.enum(['file', 'folder', 'url']),
    path: z.string().nullish(),
    mime_type: z.string().nullish(),
    downloadable: z.boolean(),
    size: z.number().nullish(),
    permissions: z.object({
      download: z.boolean(),
    }),
    exportable: z.boolean(),
    export_formats: z.array(z.string()).nullish(),
    updated_at: z.string().nullish(),
    created_at: z.string().nullish(),
    raw_data: z.any(),
  })
  .openapi({
    ref: 'unified.file',
    description: 'A unified representation of a file',
  })

export const Folder = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    path: z.string(),
    updated_at: z.string().nullish(),
    created_at: z.string().nullish(),
    raw_data: z.any(),
  })
  .openapi({
    ref: 'unified.folder',
    description: 'A unified representation of a folder',
  })
