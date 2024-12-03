import { mapper, zCast } from '@openint/vdk';
import * as unified from '../../unifiedModels';

const drive = mapper(
  zCast<any>(), // TODO: Replace 'any' with the specific type when available
  unified.Drive,
  {
    id: (record) => String(record.id),
    name: 'name',
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    raw_data: (record) => record, 
  }
);

const folder = mapper(
  zCast<any>(), // TODO: Replace 'any' with the specific type when available
  unified.Folder,
  {
    id: (record) => String(record.id),
    name: 'name',
    parent_id: (record) => record.parentReference?.id,
    drive_id: (record) => record.parentReference?.driveId,
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    raw_data: (record) => record,
  }
);

const file = mapper(
  zCast<any>(), // TODO: Replace 'any' with the specific type when available
  unified.File,
  {
    id: (record) => String(record.id),
    name: 'name',
    mimeType: (record) => record.file?.mimeType,
    file_url: (record) => record['@content.downloadUrl'],
    size: 'size',
    drive_id: (record) => record.parentReference?.driveId,
    created_at: 'createdDateTime',
    modified_at: 'lastModifiedDateTime',
    raw_data: (record) => record, 
  }
);

export const microsoftGraphMappers = {
  drive,
  folder,
  file,
}; 