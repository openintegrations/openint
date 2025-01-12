import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'
import { MsgraphSDKTypes } from '@opensdks/sdk-msgraph'

type AdapterTypes = MsgraphSDKTypes['oas']['components']['schemas']

const drive = mapper(
  zCast<AdapterTypes['microsoft.graph.drive']>(),
  unified.Drive,
  {
    id: (record) => record.id || '',
    name: (record) => record.name || '',
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    owner: (record) => record.owner?.user?.displayName || record.owner?.['group']?.['displayName'] || '',
    raw_data: (record) => record
  }
)

const folder = mapper(
  zCast<AdapterTypes['microsoft.graph.driveItem']>(),
  unified.Folder,
  {
    id: 'id',
    name: 'name',
    parent_id: 'parentReference.id',
    drive_id: 'parentReference.driveId',
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    raw_data: (record) => record
  }
)

const file = mapper(
  zCast<AdapterTypes['microsoft.graph.driveItem']>(),
  unified.File,
  {
    id: 'id',
    name: 'name',
    file_url: 'webUrl',
    download_url: '@microsoft.graph.downloadUrl',
    mime_type: 'file.mimeType',
    size: 'size',
    parent_id: 'parentReference.id',
    drive_id: 'parentReference.driveId',
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    raw_data: (record) => record
  }
)

export const mappers = {
  drive,
  folder,
  file
} 