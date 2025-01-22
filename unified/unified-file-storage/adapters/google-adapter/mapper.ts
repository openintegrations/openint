import {Oas_drive_v3} from '@opensdks/sdk-google'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

// 2025-01-22 SDK schemas: About|Change|ChangeList|Channel|Comment|CommentList|ContentRestriction|Drive|DriveList|File|FileList|GeneratedIds|Label|LabelField|LabelFieldModification|LabelList|LabelModification|ModifyLabelsRequest|ModifyLabelsResponse|Permission|PermissionList|Reply|ReplyList|Revision|RevisionList|StartPageToken|TeamDrive|TeamDriveList|User
type AdapterTypes = Oas_drive_v3['components']['schemas']

export const mappers: Record<
  keyof typeof unified,
  ReturnType<typeof mapper>
> = {
  DriveGroup: mapper(zCast<AdapterTypes['DriveList']>(), unified.DriveGroup, {
    id: (record) => record.id || '',
    name: (record) => record.name || '',
    description: (record) => record.description || null,
    updated_at: (record) => record.modifiedTime || null,
    created_at: (record) => record.createdTime || null,
    raw_data: (record) => record,
  }),
  Drive: mapper(zCast<AdapterTypes['Drive']>(), unified.Drive, {
    id: (record) => record.id || '',
    name: (record) => record.name || '',
    description: (record) => record.description || null,
    updated_at: (record) => record.modifiedTime || null,
    created_at: (record) => record.createdTime || null,
    raw_data: (record) => record,
  }),
  File: mapper(zCast<AdapterTypes['File']>(), unified.File, {
    id: (record) => record.id || '',
    name: (record) => record.name || null,
    description: (record) => record.description || null,
    type: (record) =>
      record.mimeType === 'application/vnd.google-apps.folder'
        ? 'folder'
        : 'file',
    path: (record) => record.parents?.[0] || null,
    mime_type: (record) => record.mimeType || null,
    downloadable: (record) =>
      !!record.capabilities?.canDownload && !!record.webContentLink,
    size: (record) => (record.size ? parseInt(record.size) : null),
    permissions: (record) => ({
      download: !!record.capabilities?.canDownload,
    }),
    exportable: (record) =>
      !!record.exportLinks && Object.keys(record.exportLinks).length > 0,
    export_formats: (record) =>
      record.exportLinks ? Object.keys(record.exportLinks) : null,
    updated_at: (record) => record.modifiedTime || null,
    created_at: (record) => record.createdTime || null,
    raw_data: (record) => record,
  }),
  Folder: mapper(zCast<AdapterTypes['File']>(), unified.Folder, {
    id: (record) => record.id || '',
    name: (record) => record.name || '',
    description: (record) => record.description || null,
    path: (record) => record.parents?.[0] || '',
    updated_at: (record) => record.modifiedTime || null,
    created_at: (record) => record.createdTime || null,
    raw_data: (record) => record,
  }),
}
