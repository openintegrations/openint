import { FileStorageAdapter } from '../../router'
import type { z } from '@openint/vdk'

type GoogleDriveInstance = {
  drive_v3: {
    clientOptions: {
      headers?: {
        authorization?: string
      }
    }
  }
}

export const googleDriveAdapter = {
  listDrives: async ({ instance, input }) => {
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const pageSize = input?.page_size?.toString() ?? '100'
    const pageToken = input?.cursor ?? ''

    const url = new URL('https://www.googleapis.com/drive/v3/drives')
    url.searchParams.set('pageSize', pageSize)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    // Supports shared drives
    url.searchParams.set('useDomainAdminAccess', 'true')

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    if (!res || !Array.isArray(res.drives)) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const items = res.drives.map((drive: any) => ({
      id: drive.id || '',
      name: drive.name || '',
      created_at: drive.createdTime || null,
      modified_at: drive.createdTime || null,
      raw_data: drive,
    }))

    return {
      has_next_page: !!res.nextPageToken,
      next_cursor: res.nextPageToken || undefined,
      items,
    }
  },

  getDrive: async ({ instance, input }) => {
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const driveId = input.driveId
    const url = `https://www.googleapis.com/drive/v3/drives/${driveId}?useDomainAdminAccess=true`

    const drive = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    return {
      id: drive?.id || '',
      name: drive?.name || '',
      created_at: drive?.createdTime || null,
      modified_at: drive?.createdTime || null,
      raw_data: drive,
    }
  },

  listFolders: async ({ instance, input }) => {
    if (!input?.driveId) {
      throw new Error('driveId is required')
    }
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const pageToken = input?.cursor ?? ''
    const pageSize = input?.page_size?.toString() ?? '100'

    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('corpora', 'drive')
    url.searchParams.set('driveId', input.driveId)
    url.searchParams.set('supportsAllDrives', 'true')
    url.searchParams.set('includeItemsFromAllDrives', 'true')
    url.searchParams.set('fields', 'files,id,kind,nextPageToken')
    url.searchParams.set('pageSize', pageSize)
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    url.searchParams.set('q', "mimeType='application/vnd.google-apps.folder' and trashed=false")

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    if (!res || !Array.isArray(res.files)) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const folders = res.files.map((folder: any) => ({
      id: folder.id || '',
      name: folder.name || '',
      parent_id: null,
      drive_id: input.driveId,
      created_at: null,
      modified_at: null,
      raw_data: folder,
    }))

    return {
      has_next_page: !!res.nextPageToken,
      next_cursor: res.nextPageToken || undefined,
      items: folders,
    }
  },

  getFolder: async ({ instance, input }) => {
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const folderId = input.folderId
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${folderId}`)
    url.searchParams.set('supportsAllDrives', 'true')
    url.searchParams.set('includeItemsFromAllDrives', 'true')

    const folder = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    if (!folder || folder.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('Folder not found')
    }

    return {
      id: folder.id || '',
      name: folder.name || '',
      parent_id: folder.parents?.[0] || null,
      drive_id: input.driveId,
      created_at: folder.createdTime || null,
      modified_at: folder.modifiedTime || null,
      raw_data: folder,
    }
  },

  listFiles: async ({ instance, input }) => {
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const pageToken = input?.cursor ?? ''
    const pageSize = input?.page_size?.toString() ?? '100'
    if (!input?.driveId) {
      throw new Error('driveId is required')
    }

    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('corpora', 'drive')
    url.searchParams.set('driveId', input.driveId)
    url.searchParams.set('supportsAllDrives', 'true')
    url.searchParams.set('includeItemsFromAllDrives', 'true')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    url.searchParams.set('pageSize', pageSize)
    url.searchParams.set('fields', 'files,id,kind,nextPageToken')
    const qParts = ["trashed=false", "mimeType!='application/vnd.google-apps.folder'"]
    if (input.folderId) {
      qParts.push(`'${input.folderId}' in parents`)
    }
    url.searchParams.set('q', qParts.join(' and '))

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    if (!res || !Array.isArray(res.files)) {
      return {
        has_next_page: false,
        next_cursor: undefined,
        items: [],
      }
    }

    const items = res.files.map((file: any) => ({
      id: file.id || '',
      name: file.name || '',
      file_url: null,
      download_url: null,
      mime_type: file.mimeType || null,
      size: file.size ? Number(file.size) : null,
      parent_id: file.parents?.[0] || null,
      drive_id: input.driveId,
      created_at: file.createdTime || null,
      modified_at: file.modifiedTime || null,
      raw_data: file,
    }))

    return {
      has_next_page: !!res.nextPageToken,
      next_cursor: res.nextPageToken || undefined,
      items,
    }
  },

  getFile: async ({ instance, input }) => {
    const token = instance.drive_v3.clientOptions.headers?.authorization || ''
    const fileId = input.fileId
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`)
    url.searchParams.set('supportsAllDrives', 'true')
    url.searchParams.set('includeItemsFromAllDrives', 'true')
    url.searchParams.set('fields', '*')

    const file = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token },
    }).then(response => response.json())

    if (!file || file.mimeType === 'application/vnd.google-apps.folder') {
      throw new Error('File not found')
    }

    return {
      id: file.id || '',
      name: file.name || '',
      file_url: file.webViewLink || null,
      download_url: file.webContentLink || null,
      mime_type: file.mimeType || null,
      size: file.size ? Number(file.size) : null,
      parent_id: file.parents?.[0] || null,
      drive_id: input.driveId,
      created_at: file.createdTime || null,
      modified_at: file.modifiedTime || null,
      raw_data: file,
    }
  },
} satisfies FileStorageAdapter<GoogleDriveInstance>
