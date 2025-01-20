import React, { Dispatch, SetStateAction } from 'react'

import { File } from '../types/File'
import { formatBytes } from '../utils/bytesToSize'

interface Props {
  file: File | null
  setFile: Dispatch<SetStateAction<File | null>>
  onSelect: (file: File[]) => any
}

const FileDetails = ({ file, setFile, onSelect }: Props) => {
  if (!file) return <p className="p-4 text-center">No file found</p>

  return (
    <div className="flex flex-col justify-between h-full" data-testid="file-details">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Name</dt>
          <dd className="mt-1 text-sm text-gray-900">{file?.name}</dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Size</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {file?.size ? formatBytes(file?.size) : '-'}
          </dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Mime type</dt>
          <dd className="mt-1 text-sm text-gray-900">{file?.mime_type || '-'}</dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Downloadable</dt>
          <dd className="mt-1 text-sm text-gray-900">{file?.downloadable ? 'Yes' : 'No'}</dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Created</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <div>
              <span className="mr-2 text-gray-900">
                {(file?.created_at && new Date(file.created_at).toLocaleDateString()) || '-'}
              </span>
              <span className="text-gray-500 ">
                {file?.created_at && new Date(file.created_at).toLocaleTimeString()}
              </span>
            </div>
          </dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Updated</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <div>
              <span className="mr-2 text-gray-900">
                {(file?.updated_at && new Date(file.updated_at).toLocaleDateString()) || '-'}
              </span>
              <span className="text-gray-500 ">
                {file?.updated_at && new Date(file.updated_at).toLocaleTimeString()}
              </span>
            </div>
          </dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Owner</dt>
          <dd className="mt-1 text-sm text-gray-900">{file?.owner?.name || '-'}</dd>
        </div>
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-gray-900">{file?.owner?.email || '-'}</dd>
        </div>
      </dl>
      <div className="flex justify-between pt-6">
        <button
          type="button"
          className="items-center w-full px-3 py-2 mr-2 text-sm font-medium leading-4 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm sm:mr-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setFile(null)}
        >
          Close
        </button>
        <button
          type="button"
          className="items-center w-full px-3 py-2 ml-2 text-sm font-medium leading-4 text-white bg-blue-600 border border-transparent rounded-md shadow-sm sm:ml-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => onSelect([file])}
          data-testid="select-file-button"
        >
          Select file
        </button>
      </div>
    </div>
  )
}

export default FileDetails
