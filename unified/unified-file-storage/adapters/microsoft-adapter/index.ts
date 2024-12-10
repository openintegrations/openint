import {type FileStorageAdapter} from "../../router";
import type {MsgraphSDK} from '@opensdks/sdk-msgraph'

export const microsoftGraphAdapter = {
  listDrives: async ({ instance, input }) => {
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
      return driveResponse.value.map((drive: any) => ({
        id: drive.id || '',
        name: drive.name || '',
        created_at: drive.createdDateTime,
        modified_at: drive.lastModifiedDateTime,
        integration: 'sharepoint',
        owner: drive.owner?.user?.displayName || drive.owner?.group?.displayName,
        raw_data: drive,
      }));
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
    const drive = res.data;
    return {
      id: drive?.['value']?.[0]?.['id'] || '',
      name: drive?.['value']?.[0]?.['name'] || '',
      integration: 'sharepoint',
      created_at: drive?.['value']?.[0]?.['createdDateTime'],
      modified_at: drive?.['value']?.[0]?.['lastModifiedDateTime'],
      owner: drive?.['value']?.[0]?.['owner']?.['group']?.['displayName'] || drive?.['value']?.[0]?.['owner']?.['user']?.['displayName'],
      raw_data: drive?.['value']?.[0],
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
        // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
        query: {$skiptoken: input?.cursor ?? undefined},
      }
    }) : await instance.GET(`/drives/{drive-id}/root/children`, {
      params: {
        path: {'drive-id': input.driveId},
        // @ts-expect-error TODO: "$skiptoken is supported by the API but its not clear in the documentation
        query: {$skiptoken: input?.cursor ?? undefined},
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
      file_url: item.webUrl || null,
      download_url: item['@microsoft.graph.downloadUrl'] || null,
      mime_type: item.file?.mimeType || null,
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
      file_url: res.data?.webUrl || null,
      download_url: res.data['@microsoft.graph.downloadUrl'] + '' || null,
      mime_type: res.data.file?.mimeType || null,
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
  return url.searchParams.get('$skiptoken') ?? undefined;
} 
