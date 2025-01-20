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
    const siteId = input?.driveGroupId
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

  listFiles: async ({instance, input}) => {
    let filesResponse

    if (input?.driveId) {
      // Use instance.GET for cases with driveId
      filesResponse = await instance.GET(
        input.folderId
          ? `/drives/{drive-id}/items/{driveItem-id}/children`
          : `/drives/{drive-id}/root/children`,
        {
          params: {
            path: {
              'drive-id': input.driveId,
              'driveItem-id': input.folderId,
            },
            query: {
              ...expandParams,
              // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
              $skiptoken: input?.cursor,
            },
          },
        },
      )
      filesResponse = filesResponse.data
    } else {
      // Use fetch for cases without driveId
      const response = await fetch(
        `https://graph.microsoft.com/v1.0${
          input?.folderId
            ? `/me/drive/items/${input.folderId}/children`
            : '/me/drive/root/children'
        }?${new URLSearchParams({
          ...expandParams,
          ...(input?.cursor ? {$skiptoken: input.cursor} : {}),
        })}`,
        {
          headers: {
            // @ts-expect-error
            Authorization: instance.clientOptions.headers?.authorization,
          },
        },
      )
      filesResponse = await response.json()
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
      cursor: extractCursor(filesResponse['@odata.nextLink']),
    }
  },

  getFile: async ({instance, input}) => {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${
        input.id
      }?${new URLSearchParams(expandParams)}`,
      {
        headers: {
          // @ts-expect-error
          Authorization: instance.clientOptions.headers?.authorization,
        },
      },
    )
    const res = await response.json()

    if (!res) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found',
      })
    }

    return mappers.File(res)
  },

  exportFile: async ({instance, input}) => {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${input.id}`,
      {
        headers: {
          // @ts-expect-error
          Authorization: instance.clientOptions.headers?.authorization,
        },
      },
    )
    const res = await response.json()

    if (!res || !res['@microsoft.graph.downloadUrl']) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or not downloadable',
      })
    }

    const downloadResponse = await fetch(res['@microsoft.graph.downloadUrl'])
    if (!downloadResponse.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to download file',
      })
    }

    if (!downloadResponse.body) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No response body available',
      })
    }
    return downloadResponse.body
  },

  downloadFile: async ({instance, input}) => {
    return exports.microsoftGraphAdapter.exportFile({instance, input})
  },

  listFolders: async ({instance, input}) => {
    let foldersResponse

    if (input?.driveId) {
      // Use instance.GET for cases with driveId
      const res = await instance.GET('/drives/{drive-id}/root/children', {
        params: {
          path: {'drive-id': input.driveId},
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
