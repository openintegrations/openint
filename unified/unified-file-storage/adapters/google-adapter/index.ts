import { FileStorageAdapter } from "../../router";

type GoogleDriveAdapterInstance = {
  clientOptions: {
    headers?: Record<string, string>
  }
};

export const googleDriveAdapter: FileStorageAdapter<GoogleDriveAdapterInstance> = {
  // List all drives (Team Drives) in Google Drive
  listDrives: async ({ instance, input }) => {
    const pageSize = input?.page_size ?? 100;
    const pageToken = input?.cursor ?? '';
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `https://www.googleapis.com/drive/v3/drives?pageSize=${pageSize}${tokenParam}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const data = await res.json();

    if (!data || !data.drives) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: []
      };
    }

    const items = data.drives.map((drive: any) => ({
      id: drive.id || '',
      name: drive.name || '',
      created_at: drive.createdTime || null,
      modified_at: drive.updatedTime || null,
      raw_data: drive
    }));

    return {
      has_next_page: !!data.nextPageToken,
      next_cursor: data.nextPageToken,
      items
    };
  },

  // Retrieve details of a single drive
  getDrive: async ({ instance, input }) => {
    const url = `https://www.googleapis.com/drive/v3/drives/${input.driveId}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const drive = await res.json();

    if (!drive || !drive.id) {
      throw new Error('Drive not found');
    }

    return {
      id: drive.id || '',
      name: drive.name || '',
      created_at: drive.createdTime || null,
      modified_at: drive.updatedTime || null,
      raw_data: drive
    };
  },

  // List folders in a drive using a search for items with folder mimeType
  listFolders: async ({ instance, input }) => {
    if (!input?.driveId) {
      throw new Error('driveId is required');
    }

    const pageSize = input?.page_size ?? 100;
    const pageToken = input?.cursor ?? '';
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';

    const query = `'${input.driveId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}${tokenParam}&q=${encodedQuery}&fields=files(id,name,parents,createdTime,modifiedTime),nextPageToken`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const data = await res.json();

    if (!data || !data.files) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: []
      };
    }

    const folders = data.files.map((folder: any) => ({
      id: folder.id || '',
      name: folder.name || '',
      parent_id: folder.parents && folder.parents.length ? folder.parents[0] : null,
      drive_id: input.driveId,
      created_at: folder.createdTime || null,
      modified_at: folder.modifiedTime || null,
      raw_data: folder
    }));

    return {
      has_next_page: !!data.nextPageToken,
      next_cursor: data.nextPageToken,
      items: folders
    };
  },

  // Retrieve details of a single folder
  getFolder: async ({ instance, input }) => {
    const url = `https://www.googleapis.com/drive/v3/files/${input.folderId}?fields=id,name,parents,createdTime,modifiedTime`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const folder = await res.json();

    if (!folder || !folder.id) {
      throw new Error('Folder not found');
    }

    return {
      id: folder.id || '',
      name: folder.name || '',
      parent_id: folder.parents && folder.parents.length ? folder.parents[0] : null,
      drive_id: input.driveId,
      created_at: folder.createdTime || null,
      modified_at: folder.modifiedTime || null,
      raw_data: folder
    };
  },

  // List files in a drive or folder (exclude folders by mimeType)
  listFiles: async ({ instance, input }) => {
    const pageSize = input?.page_size ?? 100;
    const pageToken = input?.cursor ?? '';
    const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const parent = input.folderId || input.driveId;
    const query = `'${parent}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}${tokenParam}&q=${encodedQuery}&fields=files(id,name,webViewLink,webContentLink,mimeType,size,parents,createdTime,modifiedTime),nextPageToken`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const data = await res.json();

    if (!data || !data.files) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: []
      };
    }

    const files = data.files.map((item: any) => ({
      id: item.id || '',
      name: item.name || '',
      file_url: item.webViewLink || null,
      download_url: item.webContentLink || null,
      mime_type: item.mimeType || null,
      size: item.size ? Number(item.size) : null,
      drive_id: input.driveId,
      created_at: item.createdTime || null,
      modified_at: item.modifiedTime || null,
      raw_data: item
    }));

    return {
      has_next_page: !!data.nextPageToken,
      next_cursor: data.nextPageToken,
      items: files
    };
  },

  // Retrieve details of a single file
  getFile: async ({ instance, input }) => {
    const url = `https://www.googleapis.com/drive/v3/files/${input.fileId}?fields=id,name,webViewLink,webContentLink,mimeType,size,parents,createdTime,modifiedTime`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': instance.clientOptions.headers?.authorization ?? ''
      }
    });
    const file = await res.json();

    if (!file || !file.id) {
      throw new Error('File not found');
    }

    return {
      id: file.id || '',
      name: file.name || '',
      file_url: file.webViewLink || null,
      download_url: file.webContentLink || null,
      mime_type: file.mimeType || null,
      size: file.size ? Number(file.size) : null,
      drive_id: input.driveId,
      created_at: file.createdTime || null,
      modified_at: file.modifiedTime || null,
      raw_data: file
    };
  }
};
