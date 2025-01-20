import {MsgraphSDKTypes} from '@opensdks/sdk-msgraph'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type AdapterTypes = MsgraphSDKTypes['oas']['components']['schemas']

export const mappers = {
  DriveGroup: mapper(
    zCast<AdapterTypes['microsoft.graph.site']>(),
    unified.DriveGroup,
    {
      id: (record) => String(record.id),
      name: 'displayName',
      description: 'description',
      updated_at: 'lastModifiedDateTime',
      created_at: 'createdDateTime',
    },
  ),

  Drive: mapper(zCast<AdapterTypes['microsoft.graph.drive']>(), unified.Drive, {
    id: (record) => String(record.id),
    name: 'name',
    description: 'description',
    updated_at: 'lastModifiedDateTime',
    created_at: 'createdDateTime',
  }),

  File: mapper(
    zCast<AdapterTypes['microsoft.graph.driveItem']>(),
    unified.File,
    {
      id: (record) => String(record.id),
      name: 'name',
      type: (record) => (record.folder ? 'folder' : 'file'),
      size: 'size',
      mime_type: (record) => record.file?.mimeType,
      downloadable: (record) => Boolean(record['@microsoft.graph.downloadUrl']),
      path: (record) => record.parentReference?.path || '/',
      permissions: (record) => ({
        download: Boolean(record['@microsoft.graph.downloadUrl']),
      }),
      exportable: () => false,
      export_formats: () => null,
      updated_at: 'lastModifiedDateTime',
      created_at: 'createdDateTime',
    },
  ),

  Folder: mapper(
    zCast<AdapterTypes['microsoft.graph.driveItem']>(),
    unified.Folder,
    {
      id: (record) => String(record.id),
      name: 'name',
      description: 'description',
      path: (record) => record.parentReference?.path || '/',
      updated_at: 'lastModifiedDateTime',
      created_at: 'createdDateTime',
    },
  ),
}
