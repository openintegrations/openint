import type {MsgraphSDK} from '@opensdks/sdk-msgraph'
import {TRPCError} from '@trpc/server'
import {type FileStorageAdapter} from '../../router'
import {mappers} from './mappers'

const expandParams = {
  $expand: 'listItem',
  $select: '*',
}

function extractCursor(nextLink?: string): string | undefined {
  if (!nextLink) return undefined
  try {
    const url = new URL(nextLink)
    return url.searchParams.get('$skiptoken') ?? undefined
  } catch {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid cursor format',
    })
  }
}

async function getFileFromDrives({
  instance,
  input,
  ctx,
}: {
  instance: MsgraphSDK
  input: {id: string; cursor?: string}
  ctx: any
}) {
  const drivesResult: any = await sharepointAdapter.listDrives({
    instance,
    input: {},
    ctx,
  })

  const filePromises = drivesResult.items.map(async (drive: any) => {
    try {
      const response = await instance.GET(
        '/drives/{drive-id}/items/{driveItem-id}',
        {
          params: {
            path: {
              'drive-id': drive.id,
              'driveItem-id': input.id,
            },
            // @ts-expect-error TODO: "$expandParams is supported by the API but its not clear in the documentation
            query: {
              ...expandParams,
            },
          },
        },
      )
      return response.data
    } catch (error: any) {
      // TODO: fix nesting in this SDK
      if (error?.error?.error?.code === 'itemNotFound') {
        return null
      }
      throw error
    }
  })

  const results = await Promise.all(filePromises)
  const validResult = results.find(
    (res) => res && res.id && res.id !== 'undefined',
  )

  if (!validResult) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found in any drive',
    })
  }

  return validResult
}

interface DownloadFileResult {
  status: number
  stream: ReadableStream<Uint8Array> | null
  resHeaders?: Headers
  error: {code: string; message: string} | null
}

export async function downloadFileById({
  fileId,
  ctx,
}: {
  fileId: string
  ctx: any
}): Promise<DownloadFileResult> {
  const file = await getFileFromDrives({
    instance: ctx.remote.instance,
    input: {id: fileId},
    ctx,
  })

  if (!file['@microsoft.graph.downloadUrl']) {
    return {
      status: 404,
      stream: null,
      error: {
        code: 'NOT_FOUND',
        message: 'File not downloadable',
      },
    }
  }

  const downloadResponse = await fetch(file['@microsoft.graph.downloadUrl'])

  if (!downloadResponse.ok) {
    return {
      status: 500,
      stream: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to download file',
      },
    }
  }

  if (!downloadResponse.body) {
    return {
      status: 500,
      stream: null,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No download response body available',
      },
    }
  }
  const headers = new Headers()
  headers.set(
    'content-type',
    downloadResponse.headers.get('content-type') ?? '',
  )
  if (
    downloadResponse.headers.get('content-length') &&
    !downloadResponse.headers.get('transfer-encoding')?.includes('chunked')
  ) {
    headers.set(
      'content-length',
      downloadResponse.headers.get('content-length') ?? '',
    )
  }
  headers.set(
    'content-disposition',
    downloadResponse.headers.get('content-disposition') ?? '',
  )

  return {
    status: 200,
    stream: downloadResponse.body,
    resHeaders: headers,
    error: null,
  }
}

export const sharepointAdapter = {
  listDriveGroups: async ({instance, input}) => {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/sites?search=*&$skiptoken=${
        input?.cursor ?? ''
      }`,
      {
        headers: {
          // @ts-expect-error
          Authorization: instance.clientOptions.headers?.authorization,
        },
      },
    ).then((response) => response.json())

    if (!res || !Array.isArray(res.value)) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid response from Microsoft Graph API',
      })
    }

    return {
      has_next_page: !!res['@odata.nextLink'],
      items: res.value.map(mappers.DriveGroup),
      cursor: extractCursor(res['@odata.nextLink']),
    }
  },

  listDrives: async ({instance, input}) => {
    const siteId = input?.drive_group_id
    let drivesResponse

    if (siteId) {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
        {
          headers: {
            // @ts-expect-error
            Authorization: instance.clientOptions.headers?.authorization,
          },
        },
      ).then((response) => response.json())

      drivesResponse = {
        value: response.value || [],
        '@odata.nextLink': response['@odata.nextLink'],
      }
    } else {
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/sites?search=*`,
        {
          headers: {
            // @ts-expect-error
            Authorization: instance.clientOptions.headers?.authorization,
          },
        },
      ).then((response) => response.json())

      if (!res || !Array.isArray(res.value)) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch sites',
        })
      }

      const sites = res.value
      const drivesPromises = sites.map((site: any) =>
        fetch(`https://graph.microsoft.com/v1.0/sites/${site.id}/drives`, {
          headers: {
            // @ts-expect-error
            Authorization: instance.clientOptions.headers?.authorization,
          },
        })
          .then((response) => response.json())
          .catch(() => ({value: []})),
      )
      const allDrivesResponses = await Promise.all(drivesPromises)
      drivesResponse = {
        value: allDrivesResponses.flatMap((resp) => resp.value || []),
        '@odata.nextLink': allDrivesResponses.find(
          (resp) => resp['@odata.nextLink'],
        )?.['@odata.nextLink'],
      }
    }

    if (!drivesResponse.value) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch drives',
      })
    }

    return {
      has_next_page: !!drivesResponse['@odata.nextLink'],
      items: drivesResponse.value.map(mappers.Drive),
      cursor: extractCursor(drivesResponse['@odata.nextLink']),
    }
  },

  listFiles: async ({instance, input, ctx}) => {
    let filesResponse

    if (input?.drive_id) {
      const endpoint = input.folder_id
        ? `/drives/{drive-id}/items/{driveItem-id}/children`
        : `/drives/{drive-id}/root/children`

      try {
        filesResponse = await instance.GET(endpoint, {
          params: {
            path: {
              'drive-id': input.drive_id,
              'driveItem-id': input.folder_id,
            },
            query: {
              ...expandParams,
              // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
              $skiptoken: input?.cursor,
            },
          },
        })
        filesResponse = filesResponse.data
      } catch (error) {
        throw error
      }
    } else {
      if (input?.cursor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Pagination is only supported when specifying a drive_id',
        })
      }

      const drivesResult = await sharepointAdapter.listDrives({
        instance,
        input: {},
        ctx,
      })

      const allFilesPromises = drivesResult.items.map(async (drive: any) => {
        try {
          const endpoint = input?.folder_id
            ? `/drives/{drive-id}/items/{driveItem-id}/children`
            : `/drives/{drive-id}/root/children`

          const response = await instance.GET(endpoint, {
            params: {
              path: {
                'drive-id': drive.id,
                'driveItem-id': input?.folder_id,
              },
              query: {
                ...expandParams,
                // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
                $skiptoken: input?.cursor,
              },
            },
          })
          return response.data.value || []
        } catch (error) {
          return []
        }
      })

      const allFilesArrays: any[][] = await Promise.all(allFilesPromises)
      filesResponse = {
        value: allFilesArrays.flat(),
        '@odata.nextLink': undefined, // Pagination not supported when searching all drives
      }
    }

    if (!filesResponse.value) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch files',
      })
    }

    return {
      has_next_page: !!filesResponse['@odata.nextLink'],
      items: filesResponse.value
        .filter((item: any) => item.file)
        .map(mappers.File),
      cursor: extractCursor(filesResponse['@odata.nextLink'] ?? ''),
    }
  },

  getFile: async ({instance, input, ctx}) => {
    const file = await getFileFromDrives({instance, input, ctx})
    return mappers.File(file)
  },

  exportFile: async () => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Export file is not available in Sharepoint',
    })
  },

  downloadFile: async ({input, ctx}) => {
    const {resHeaders, stream, status, error} = await downloadFileById({
      fileId: input.id,
      ctx,
    })

    if (status !== 200 || error || !stream) {
      throw new TRPCError({
        // @ts-expect-error
        code: error?.code ?? 'INTERNAL_SERVER_ERROR',
        message: error?.message ?? 'Failed to download file',
      })
    }

    resHeaders?.forEach((value, key) => {
      ctx.resHeaders.set(key, value)
    })

    return stream
  },

  listFolders: async ({instance, input}) => {
    let foldersResponse

    if (input?.drive_id) {
      // Use instance.GET for cases with driveId
      const res = await instance.GET('/drives/{drive-id}/root/children', {
        params: {
          path: {'drive-id': input.drive_id},
          query: {
            $filter: 'folder ne null',
            // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
            $skiptoken: input?.cursor,
          },
        },
      })
      foldersResponse = res.data
    } else {
      // Use fetch for cases without driveId
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root/children?${new URLSearchParams(
          {
            $filter: 'folder ne null',
            ...(input?.cursor ? {$skiptoken: input.cursor} : {}),
          },
        )}`,
        {
          headers: {
            // @ts-expect-error
            Authorization: instance.clientOptions.headers?.authorization,
          },
        },
      )
      foldersResponse = await response.json()
    }

    if (!foldersResponse.value) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch folders',
      })
    }

    return {
      has_next_page: !!foldersResponse['@odata.nextLink'],
      items: foldersResponse.value.map(mappers.Folder),
      cursor: extractCursor(foldersResponse['@odata.nextLink']),
    }
  },
} satisfies FileStorageAdapter<MsgraphSDK>
