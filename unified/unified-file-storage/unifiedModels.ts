import {z} from '@openint/vdk'

// Drive object representing a storage drive (e.g., Google Drive, SharePoint)
export const Drive = z
  .object({
    id: z.string(),
    name: z.string(),
    created_at: z.string().nullish(),
    modified_at: z.string().nullish(),
    raw_data: z.record(z.unknown()).optional(),
  })
  .openapi({
    ref: 'unified.drive',
    description: 'A unified representation of a storage drive',
  });

// Folder object representing a folder within a drive
export const Folder = z
  .object({
    id: z.string(),
    name: z.string(),
    parent_id: z.string().nullish(),
    drive_id: z.string(),
    created_at: z.string().nullish(),
    modified_at: z.string().nullish(),
    raw_data: z.record(z.unknown()).optional(),
  })
  .openapi({
    ref: 'unified.folder',
    description: 'A unified representation of a folder within a drive',
  });

// File object representing a file within a drive
export const File = z
  .object({
    id: z.string(),
    name: z.string(),
    file_url: z.string(),
    mimeType: z.string().nullish(),
    size: z.number().nullish(),
    drive_id: z.string(),
    created_at: z.string().nullish(),
    modified_at: z.string().nullish(),
    raw_data: z.record(z.unknown()).optional(),
  })
  .openapi({
    ref: 'unified.file',
    description: 'A unified representation of a file within a drive',
  });
