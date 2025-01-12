import {type FileStorageAdapter} from "../../router";
import type {MsgraphSDK} from '@opensdks/sdk-msgraph'
import {mappers} from './mapper'
import { TRPCError } from "@openint/vdk";

const expandParams = {
  $expand: 'listItem',
  $select: '*',
}
export const microsoftGraphAdapter: FileStorageAdapter<MsgraphSDK> = {
  listDrives: async ({ instance, input }) => {
    // TODO: add /sites to openSDK 
    const res = await fetch(`https://graph.microsoft.com/v1.0/sites?search=*&$skiptoken=${input?.cursor ?? ''}`, {
      method: 'GET',
      headers: {
        // @ts-expect-error 
        'Authorization': instance.clientOptions.headers?.authorization,
      },
    }).then(response => response.json());

    if (!res || !Array.isArray(res.value)) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const drivesPromises = res.value.map((site: any) => {
      const siteId = site.id;
      // TODO: add /sites to openSDK 
      return fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
        method: 'GET',
        headers: {
          // @ts-expect-error 
          'Authorization': instance.clientOptions.headers?.authorization,
        },
      }).then(response => response.json());
    });

    const drivesResponses = await Promise.all(drivesPromises);

    const allDrives = drivesResponses.flatMap((driveResponse: any) => {
      if (!driveResponse || !Array.isArray(driveResponse.value)) {
        return [];
      }
      return driveResponse.value.map(mappers.Drive);
    });

    return {
      has_next_page: res['@odata.nextLink'] ? true : false,
      next_cursor: res['@odata.nextLink'] ? extractCursor(res['@odata.nextLink']) : undefined,
      items: allDrives,
    };
  },

  getDrive: async ({ instance }) => {
    const res = await instance.GET('/drives/{drive-id}', {
      params: {path: {'drive-id': ''}},
    })
    if(!res.data?.['value']?.[0]) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'Drive not found'});
    }
    return mappers.Drive(res.data?.['value']?.[0]);
  },

  listFolders: async ({ instance, input }) => {
    if(!input?.driveId) {
      throw new TRPCError({code: 'BAD_REQUEST', message: 'drive_id is required'});
    }
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/drives/{drive-id}/root/children', {
      params: {
        path: {'drive-id': input?.driveId ?? ''},
        query: {
          // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
          $skiptoken: input?.cursor ?? undefined,
          $filter: "folder ne null",
        },
      }
    });

    if(!res.data || !res.data.value) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: res.data.value.map(mappers.Folder),
    };
  },

  getFolder: async ({ instance, input }) => {
    const res = await instance.GET(`/drives/{drive-id}/items/{driveItem-id}`, {
      params: {
        path: {'drive-id': input.driveId, 'driveItem-id': input.folderId},
      }
    });

    if(!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'Folder not found'});
    }

    return mappers.Folder(res.data);
  },

  listFiles: async ({ instance, input }) => {

    const res = input.folderId
      ? await instance.GET(`/drives/{drive-id}/items/{driveItem-id}/children`, {
          params: {
            path: { 'drive-id': input.driveId, 'driveItem-id': input.folderId },
             // $expand is currently supported an a string[] and sends multiple $expand
             // queries but this is not supported by the API, it expects a single comma separated string
             // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
            query: { $skiptoken: input?.cursor ?? undefined, ...expandParams },
          },
        })
      : await instance.GET(`/drives/{drive-id}/root/children`, {
          params: {
            path: { 'drive-id': input.driveId },
            // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation. Same for expand
            query: { $skiptoken: input?.cursor ?? undefined, ...expandParams },
          },
        });

    if (!res.data || !res.data.value) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      };
    }

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: res.data.value.map(mappers.File),
    };
  },

  getFile: async ({ instance, input }) => {
    const res = await instance.GET(`/drives/{drive-id}/items/{driveItem-id}`, {
      params: {
        path: { 'drive-id': input.driveId, 'driveItem-id': input.fileId },
        // @ts-expect-error TODO: "$expand is supported by the API but its not clear in the documentation
        query: { ...expandParams },
      },
    });

    if (!res.data) {
      throw new TRPCError({code: 'NOT_FOUND', message: 'File not found'});
    }

    return mappers.File(res.data);
  }
}

// Helper function to extract cursor from nextLink
function extractCursor(nextLink: string): string | undefined {
  const url = new URL(nextLink);

  // TODO: verify this is the correct cursor
  return url.searchParams.get('$skiptoken') ?? undefined;
} 
