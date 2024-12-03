export const microsoftGraphAdapter = {
  listDrives: async ({ instance, input }) => {
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/me/drives', {
      params: {
        top: input?.page_size,
        skip: input?.cursor,
      },
    });

    const drives = res.data.value.map((drive: any) => ({
      id: drive.id,
      name: drive.name,
      created_at: drive.createdDateTime,
      modified_at: drive.lastModifiedDateTime,
      owner: drive.owner?.user?.displayName,
      raw_data: drive,
    }));

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: drives,
    };
  },

  getDrive: async ({ instance, input }) => {
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/drives/{drive-id}/root/listItem/fields', {
      params: {path: {'drive-id': ''}},
    })
    const drive = res.data;

    return {
      id: drive.id,
      name: drive.name,
      type: 'sharepoint',
      created_at: drive.createdDateTime,
      modified_at: drive.lastModifiedDateTime,
      owner: drive.owner?.user?.displayName,
      raw_data: drive,
    };
  },

  listFolders: async ({ instance, input }) => {
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/me/drive/root/children', {
      params: {
        top: input?.page_size,
        skip: input?.cursor,
        filter: "folder ne null",
      },
    });

    const folders = res.data.value.map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      parent_id: folder.parentReference?.id,
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
    // TODO: replace with correct drive endpoint
    const res = await instance.GET(`/me/drive/items/${input.folderId}`);
    const folder = res.data;

    return {
      id: folder.id,
      name: folder.name,
      parent_id: folder.parentReference?.id,
      drive_id: folder.parentReference?.driveId,
      created_at: folder.createdDateTime,
      modified_at: folder.lastModifiedDateTime,
      raw_data: folder,
    };
  },

  listFiles: async ({ instance, input }) => {
    // TODO: replace with correct drive endpoint
    const res = await instance.GET('/me/drive/root/children', {
      params: {
        top: input?.page_size,
        skip: input?.cursor,
        filter: "file ne null",
      },
    });

    const files = res.data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.file?.mimeType,
      size: file.size,
      parent_id: file.parentReference?.id,
      drive_id: file.parentReference?.driveId,
      created_at: file.createdDateTime,
      modified_at: file.lastModifiedDateTime,
      raw_data: file,
    }));

    return {
      has_next_page: res.data['@odata.nextLink'] ? true : false,
      next_cursor: res.data['@odata.nextLink'] ? extractCursor(res.data['@odata.nextLink']) : undefined,
      items: files,
    };
  },

  getFile: async ({ instance, input }) => {
    // TODO: replace with correct drive endpoint
    const res = await instance.GET(`/me/drive/items/${input.fileId}`);
    const file = res.data;

    return {
      id: file.id,
      name: file.name,
      mimeType: file.file?.mimeType,
      size: file.size,
      parent_id: file.parentReference?.id,
      drive_id: file.parentReference?.driveId,
      created_at: file.createdDateTime,
      modified_at: file.lastModifiedDateTime,
      raw_data: file,
    };
  },
};

// Helper function to extract cursor from nextLink
function extractCursor(nextLink: string): string | undefined {
  const url = new URL(nextLink);
  return url.searchParams.get('$skip');
} 