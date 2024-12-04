import {type FileStorageAdapter} from "../../router";
import type {MsgraphSDK} from '@opensdks/sdk-msgraph'

export const microsoftGraphAdapter = {
  listDrives: async ({ instance, input,  }) => {
    const res = await instance.GET('/drives', {
      params: {
        query: {
          // @ts-expect-error figure out pagination 
          // "$skip is not supported on this API. Only URLs returned by the API can be used to page
          $skipToken: input?.cursor ?? undefined,
        },
      },
    });

    if(!res.data || !res.data.value) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const drives = res.data.value.map((drive) => ({
      id: drive.id || '',
      name: drive.name || '',
      created_at: drive.createdDateTime,
      modified_at: drive.lastModifiedDateTime,
      // todo: potentially parse from weburl includes webUrl or based on the integration_id
      integration: 'sharepoint',
      owner: drive.owner?.['group']?.['displayName'] || drive.owner?.['user']?.['displayName'],
      raw_data: drive,
    }));

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: drives,
    };
  },

  getDrive: async ({ instance }) => {
    const res = await instance.GET('/drives/{drive-id}', {
      params: {path: {'drive-id': ''}},
    })
    const drive = res.data;
    return {
      id: drive.id || '',
      name: drive.name || '',
      integration: 'sharepoint',
      created_at: drive.createdDateTime,
      modified_at: drive.lastModifiedDateTime,
      owner: drive.owner?.['group']?.['displayName'] || drive.owner?.['user']?.['displayName'],
      raw_data: drive,
    };
  },

  listFolders: async ({ instance, input }) => {
    // TODO: QQ: is this the right type of error to throw?
    if(!input?.driveId) {
      throw new Error('drive_id is required');
    }
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/drives/{drive-id}/root/children', {
      params: {
        path: {'drive-id': input?.driveId ?? ''},
        query: {
          // @ts-expect-error figure out pagination 
          // "$skip is not supported on this API. Only URLs returned by the API can be used to page
          $skipToken: input?.cursor ?? undefined,
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

    const folders = res.data.value.map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      parent_id: folder.parentReference?.id,
      integration: 'sharepoint',
      drive_id: folder.parentReference?.driveId,
      created_at: folder.createdDateTime,
      modified_at: folder.lastModifiedDateTime,
      raw_data: folder,
    }));

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: folders,
    };
  },

  getFolder: async ({ instance, input }) => {
    // TODO: Sample static return for getFolder
    const res = await instance.GET(`/drives/{drive-id}/items/{driveItem-id}`, {
      params: {
        path: {'drive-id': input.driveId, 'driveItem-id': input.folderId},
      }
    });

    if(!res.data) {
      // TODO: QQ: is this the right type of error to throw?
      throw new Error('Folder not found');
    }

    const folder = res.data;

    return {
      id: folder.id || '',
      name: folder.name || '',
      parent_id: folder.parentReference?.id,
      drive_id: folder.parentReference?.driveId || '',
      created_at: folder.createdDateTime,
      modified_at: folder.lastModifiedDateTime,
      raw_data: folder,
    };
  },

  listFiles: async ({ instance, input }) => {
    
    // is there a way to make this less verbose?
    const res = input.folderId ? await instance.GET(`/drives/{drive-id}/items/{driveItem-id}/children`, {
      params: {
        path: {'drive-id': input.driveId, 'driveItem-id': input.folderId},
        query: {$filter: "true"},
      }
    }) : await instance.GET(`/drives/{drive-id}/items`, {
      params: {
        path: {'drive-id': input.driveId},
        query: {$filter: "true"},
      }
    });

    if(!res.data || !res.data.value) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const items = res.data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      file_url: item.webUrl || '',
      mimeType: item.file?.mimeType || null,
      size: item.size || null,
      parent_id: item.parentReference?.id,
      drive_id: item.parentReference?.driveId,
      created_at: item.createdDateTime || null,
      modified_at: item.lastModifiedDateTime || null,
      raw_data: item,
    }));

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: items,
    };
  },

  getFile: async ({ instance, input }) => {
    // TODO: Sample static return for getFile
    const res = await instance.GET(`/drives/{drive-id}/items/{driveItem-id}`, {
      params: {
        path: {'drive-id': input.driveId, 'driveItem-id': input.fileId},
      }
    });

    if(!res.data) {
      // TODO: QQ: is this the right type of error to throw?
      throw new Error('File not found');
    }

    return {
      id: res.data.id || '',
      name: res.data.name || '',
      file_url: res.data.webUrl || '',
      mimeType: res.data.file?.mimeType || null,
      size: res.data.size || null,
      parent_id: res.data.parentReference?.id,
      drive_id: res.data.parentReference?.driveId || '',
      created_at: res.data.createdDateTime,
      modified_at: res.data.lastModifiedDateTime,
      raw_data: res.data,
    };
  }
} satisfies FileStorageAdapter<MsgraphSDK>;

// Helper function to extract cursor from nextLink
function extractCursor(nextLink: string): string | undefined {
  const url = new URL(nextLink);

  // TODO: verify this is the correct cursor
  return url.searchParams.get('$skip') ?? undefined;
} 