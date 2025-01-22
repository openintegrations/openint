import type {googleServer} from '@openint/connector-google'
import {TRPCError} from '@openint/vdk'
import {type FileStorageAdapter} from '../../router'
import {mappers} from './mapper'

interface DownloadFileResult {
  status: number
  stream: ReadableStream<Uint8Array> | null
  resHeaders?: Headers
  error: {code: string; message: string} | null
}

export async function downloadFileById({
  fileId,
  ctx,
  exportFormat,
}: {
  fileId: string
  ctx: any
  exportFormat?: string
}): Promise<DownloadFileResult> {
  try {
    const endpoint = exportFormat
      ? '/files/{fileId}/export'
      : '/files/{fileId}/download'
    const queryParams = exportFormat ? {mimeType: exportFormat} : undefined

    const res = await ctx.remote.instance.drive_v3.GET(endpoint, {
      params: {
        path: {fileId},
        query: queryParams,
      },
      parseAs: 'blob',
    })

    if (!res.data) {
      return {
        status: 404,
        stream: null,
        error: {
          code: 'NOT_FOUND',
          message: exportFormat
            ? 'File not found or cannot be exported. Please see select an export_format returned with the file.'
            : 'File not found',
        },
      }
    }

    const headers = new Headers()
    // Set response headers from Google Drive response
    if (res.response.headers) {
      headers.set('content-type', res.response.headers['content-type'] ?? '')
      headers.set(
        'content-length',
        res.response.headers['content-length'] ?? '',
      )
      headers.set(
        'content-disposition',
        res.response.headers['content-disposition'] ?? '',
      )
      headers.set(
        'transfer-encoding',
        res.response.headers['transfer-encoding'],
      )
      headers.set('content-encoding', res.response.headers['content-encoding'])
    }

    return {
      status: 200,
      stream: res.response.body,
      resHeaders: headers,
      error: null,
    }
  } catch (error: any) {
    return {
      status: error.message.includes('404') ? 404 : 500,
      stream: null,
      error: {
        code: error.message.includes('404')
          ? 'NOT_FOUND'
          : 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to download file',
      },
    }
  }
}

export const googleAdapter: FileStorageAdapter<
  ReturnType<typeof googleServer.newInstance>
> = {
  listDriveGroups: async () => {
    return {
      has_next_page: false,
      items: [],
      next_cursor: null,
    }
  },

  listDrives: async ({instance, input}) => {
    const res = await instance.drive_v3.GET('/drives', {
      params: {
        query: {
          pageSize: input?.page_size,
          pageToken: input?.cursor || undefined,
        },
      },
    })

    if (!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'No drives found'})
    }

    return {
      has_next_page: false,
      items: [],
      next_cursor: null,
    }
  },

  listFiles: async ({instance, input}) => {
    const res = await instance.drive_v3.GET('/files', {
      params: {
        query: {
          q: input?.folder_id ? `'${input.folder_id}' in parents` : undefined,
          pageSize: input?.page_size,
          pageToken: input?.cursor || undefined,
          fields: '*',
        },
      },
    })

    if (!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'No files found'})
    }

    return {
      has_next_page: res.data.incompleteSearch || false,
      items: res.data.files?.map(mappers.File) || [],
      next_cursor: res.data.nextPageToken || null,
    }
  },

  getFile: async ({instance, input}) => {
    const res = await instance.drive_v3.GET('/files/{fileId}', {
      params: {
        path: {fileId: input.id},
        query: {
          fields: '*',
        },
      },
    })

    if (!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'File not found'})
    }

    return mappers.File(res.data)
  },

  exportFile: async ({instance, input}) => {
    const {stream, status, error} = await downloadFileById({
      fileId: input.id,
      ctx: {remote: {instance}},
      exportFormat: input.format,
    })

    if (status !== 200 || error || !stream) {
      throw new TRPCError({
        code: (error?.code as any) ?? 'INTERNAL_SERVER_ERROR',
        message: error?.message ?? 'Failed to export file',
      })
    }

    return stream
  },

  downloadFile: async ({instance, input, ctx}) => {
    const {resHeaders, stream, status, error} = await downloadFileById({
      fileId: input.id,
      ctx: {remote: {instance}},
    })

    if (status !== 200 || error || !stream) {
      throw new TRPCError({
        code: (error?.code as any) ?? 'INTERNAL_SERVER_ERROR',
        message: error?.message ?? 'Failed to download file',
      })
    }

    resHeaders?.forEach((value, key) => {
      ctx.resHeaders.set(key, value)
    })

    return stream
  },

  listFolders: async ({instance, input}) => {
    const res = await instance.drive_v3.GET('/files', {
      params: {
        query: {
          q: "mimeType='application/vnd.google-apps.folder'",
          pageSize: input?.page_size,
          pageToken: input?.cursor || undefined,
          fields: '*',
        },
      },
    })

    if (!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'No folders found'})
    }

    return {
      has_next_page: res.data.incompleteSearch || false,
      items: res.data.files?.map(mappers.Folder) || [],
      next_cursor: res.data.nextPageToken || null,
    }
  },
}
