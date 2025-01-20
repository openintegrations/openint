import React, {Fragment, useEffect, useState} from 'react'
import {Waypoint} from 'react-waypoint'
import useSWRInfinite from 'swr/infinite'
import {Connection} from '..'
import {File} from '../types/File'
import {useDebounce} from '../utils/useDebounce'
import {usePrevious} from '../utils/usePrevious'
import Breadcrumbs from './Breadcrumbs'
import FileDetails from './FileDetails'
import FilesTable from './FilesTable'
import LoadingTable from './LoadingTable'
import Search from './Search'
import SlideOver from './SlideOver'

interface Props {
  /**
   * The function that gets called when files are selected
   */
  onSelect: (file: File[]) => any
  /**
   * The currently active connection
   */
  connection: Connection
}

const FilesContainer = ({onSelect, connection}: Props) => {
  const [folderId, setFolderId] = useState<null | string>(null)
  const [folders, setFolders] = useState<File[]>([])
  const [file, setFile] = useState<null | File>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<File[]>()
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm)
  const integrationId = connection.integrationId
  const prevIntegrationId = usePrevious(integrationId)
  const searchMode = !!debouncedSearchTerm?.length

  const fetcher = async (url: string): Promise<any> => {
    const response = await fetch(url)
    return await response.json()
  }

  const getKey = (pageIndex: number, previousPage: any) => {
    // If we switch from connector we want the folder ID to always be root
    const id =
      (prevIntegrationId && prevIntegrationId !== integrationId) || !folderId
        ? 'root'
        : folderId
    const filterParams =
      id === 'shared' ? 'filter[shared]=true' : `filter[folder_id]=${id}`

    // TODO: replace
    const fileUrl = `https://api.openint.dev/unified/file-storage/files?limit=30&${filterParams}`

    if (previousPage && !previousPage?.data?.length) return null
    if (pageIndex === 0) return `${fileUrl}#serviceId=${integrationId}`

    const cursor = previousPage?.meta?.cursors?.next

    // We add the serviceId to the end of the URL so SWR caches the request results per service
    return `${fileUrl}&cursor=${cursor}#serviceId=${integrationId}`
  }

  const {data, size, error, setSize} = useSWRInfinite(getKey, fetcher, {
    shouldRetryOnError: false,
  })

  const nextPage = () => {
    const nextCursor =
      data?.length && data[data.length - 1]?.meta?.cursors?.next
    if (nextCursor) {
      setSize(size + 1)
    }
  }

  const handleSelect = (file: File) => {
    if (file.type === 'folder') {
      setFolderId(file.id)
      if (searchMode) {
        setSearchTerm('')
        setIsSearchVisible(false)
        setFolders([file])
      } else {
        setFolders([...folders, file])
      }
    }

    if (file.type === 'file') {
      setFile(file)
    }
  }

  const handleBreadcrumbClick = (file?: File) => {
    if (file) {
      setFolderId(file.id)
      const index = folders.indexOf(file)
      const newArray = [...folders.slice(0, index + 1)]
      setFolders(newArray)
    } else {
      setFolderId('root')
      setFolders([])
    }
  }

  const filesError = error || (data?.length && data[data.length - 1]?.error)
  const isLoading = !data && !error
  const isLoadingMore =
    size > 0 && data && typeof data[size - 1] === 'undefined'

  let files = data?.length
    ? data.map((page) => page?.data).flat()
    : data
      ? [data]
      : []

  // TODO: add sharepoint sites to root folder

  // Add Google Drive shared folder to root
  if (
    (!folderId || folderId === 'root') &&
    data?.length &&
    integrationId === 'google-drive'
  ) {
    const sharedFolder = {id: 'shared', name: 'Shared with me', type: 'folder'}
    if (files?.length) {
      files = [sharedFolder, ...files]
    } else {
      files.push(sharedFolder)
    }
  }

  useEffect(() => {
    if (debouncedSearchTerm?.length) {
      setIsSearching(true)

      // TODO: replace with openint sdk call
      const searchFiles = async () => {
        const url = 'https://api.openint.dev/unified/file-storage/files/search'
        const options = {
          method: 'POST',
          body: JSON.stringify({query: debouncedSearchTerm}),
        }

        const response = await fetch(url, options)
        return response.json()
      }

      // Search for files in the current connection
      searchFiles()
        .then((response) => {
          const results =
            response?.data?.map((file: File) => ({
              ...file,
              connection,
            })) || []

          setSearchResults(results)
        })
        .finally(() => setIsSearching(false))
    }
  }, [debouncedSearchTerm, integrationId])

  const hasFiles = searchMode ? searchResults?.length : files?.length

  return (
    <Fragment>
      <div
        className="relative mb-2 flex items-center justify-between"
        data-testid="files-container">
        <Breadcrumbs folders={folders} handleClick={handleBreadcrumbClick} />
        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearchVisible={isSearchVisible}
          setIsSearchVisible={setIsSearchVisible}
        />
      </div>
      {isLoading || isSearching ? (
        <LoadingTable isSearching={isSearching} />
      ) : null}
      {!isLoading && !isSearching && hasFiles && !filesError ? (
        <FilesTable
          data={searchMode && searchResults ? searchResults : files}
          handleSelect={handleSelect}
          isLoadingMore={isLoadingMore}
          searchMode={searchMode}
        />
      ) : null}
      {!isLoading && !isSearching && !hasFiles ? (
        <p className="py-4 text-center text-sm text-gray-700">No files found</p>
      ) : null}
      {!isLoading ? (
        <SlideOver open={!!file}>
          <FileDetails file={file} setFile={setFile} onSelect={onSelect} />
        </SlideOver>
      ) : null}
      {!isLoading && filesError ? (
        <p className="mt-2 text-sm text-red-600">
          {filesError?.message || filesError}
        </p>
      ) : null}
      {files?.length && !isLoadingMore && !searchMode ? (
        <div className="flex flex-row-reverse border-gray-200 py-4">
          <Waypoint onEnter={() => nextPage()} />
        </div>
      ) : null}
    </Fragment>
  )
}

export default FilesContainer
