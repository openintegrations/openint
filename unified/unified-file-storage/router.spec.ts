/* eslint-disable jest/no-standalone-expect */
import {Blob} from 'buffer'
import {forEachAdapterConnections as describeEachAdapterConnections} from '@openint/vdk/vertical-test-utils'
import adapters from './adapters'
import type {FileStorageAdapter} from './router'

describeEachAdapterConnections<FileStorageAdapter<unknown>>(adapters, (t) => {
  let testFileId: string
  let testDriveId: string
  let testFolderId: string

  t.testIfImplemented('listDriveGroups', async () => {
    // Test default pagination
    const res = await t.sdkForConn.GET('/unified/file-storage/drive-groups', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)

    // Test with pagination params
    const resWithPagination = await t.sdkForConn.GET(
      '/unified/file-storage/drive-groups',
      {
        params: {query: {page_size: 5}},
      },
    )
    expect(resWithPagination.data.items.length).toBeLessThanOrEqual(5)

    // Test cursor-based pagination if we have items
    if (
      resWithPagination.data.items.length === 5 &&
      resWithPagination.data.next_cursor
    ) {
      const resWithCursor = await t.sdkForConn.GET(
        '/unified/file-storage/drive-groups',
        {
          params: {
            query: {
              cursor: resWithPagination.data.next_cursor,
              page_size: 5,
            },
          },
        },
      )
      expect(resWithCursor.data.items).toBeTruthy()
      expect(Array.isArray(resWithCursor.data.items)).toBe(true)
    }

    if (res.data.items.length > 0 && res.data.items[0]) {
      const group = res.data.items[0]
      expect(group.id).toBeTruthy()
      expect(group.name).toBeTruthy()
      expect(typeof group.name).toBe('string')
      expect(group.raw_data).toBeTruthy()
      expect(Object.keys(group.raw_data).length).toBeGreaterThan(0)
    }
  })

  t.testIfImplemented('listDrives', async () => {
    // First get a drive group ID for testing
    let testDriveGroupId: string | undefined
    const driveGroupsRes = await t.sdkForConn.GET(
      '/unified/file-storage/drive-groups',
      {},
    )
    if (driveGroupsRes.data.items.length > 0 && driveGroupsRes.data.items[0]) {
      testDriveGroupId = driveGroupsRes.data.items[0].id
    }

    // Test default listing
    const res = await t.sdkForConn.GET('/unified/file-storage/drives', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)

    // Test with pagination
    const resWithPagination = await t.sdkForConn.GET(
      '/unified/file-storage/drives',
      {
        params: {query: {page_size: 5}},
      },
    )
    expect(resWithPagination.data.items.length).toBeLessThanOrEqual(5)

    // Test cursor-based pagination if we have items
    if (
      resWithPagination.data.items.length === 5 &&
      resWithPagination.data.next_cursor
    ) {
      const resWithCursor = await t.sdkForConn.GET(
        '/unified/file-storage/drives',
        {
          params: {
            query: {
              cursor: resWithPagination.data.next_cursor,
              page_size: 5,
            },
          },
        },
      )
      expect(resWithCursor.data.items).toBeTruthy()
      expect(Array.isArray(resWithCursor.data.items)).toBe(true)
    }

    if (res.data.items.length > 0 && res.data.items[0]) {
      const drive = res.data.items[0]
      testDriveId = drive.id
      expect(drive.id).toBeTruthy()
      expect(drive.name).toBeTruthy()
      expect(typeof drive.name).toBe('string')
      expect(drive.raw_data).toBeTruthy()
      expect(Object.keys(drive.raw_data).length).toBeGreaterThan(0)
    }

    // Test with driveGroupId if we have one
    if (testDriveGroupId) {
      const resWithGroup = await t.sdkForConn.GET(
        '/unified/file-storage/drives',
        {
          params: {
            query: {
              drive_group_id: testDriveGroupId,
              page_size: 5,
            },
          },
        },
      )
      expect(resWithGroup.data.items).toBeTruthy()
      expect(Array.isArray(resWithGroup.data.items)).toBe(true)
    }
  })

  t.testIfImplemented('listFiles', async () => {
    // Test default listing
    const res = await t.sdkForConn.GET('/unified/file-storage/files')
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)

    // Test with pagination
    const resWithPagination = await t.sdkForConn.GET(
      '/unified/file-storage/files',
      {
        params: {query: {page_size: 3}},
      },
    )
    expect(resWithPagination.data.items.length).toBeLessThanOrEqual(3)

    // Test cursor-based pagination if we have items
    if (
      resWithPagination.data.items.length === 3 &&
      resWithPagination.data.next_cursor
    ) {
      const resWithCursor = await t.sdkForConn.GET(
        '/unified/file-storage/files',
        {
          params: {
            query: {
              cursor: resWithPagination.data.next_cursor,
              page_size: 3,
            },
          },
        },
      )
      expect(resWithCursor.data.items).toBeTruthy()
      expect(Array.isArray(resWithCursor.data.items)).toBe(true)
    }

    if (testDriveId) {
      // Test files in specific drive
      const resWithDrive = await t.sdkForConn.GET(
        '/unified/file-storage/files',
        {
          params: {query: {drive_id: testDriveId}},
        },
      )
      expect(Array.isArray(resWithDrive.data.items)).toBe(true)
    }

    // Test files in specific folder if we have one
    if (testFolderId) {
      const resWithFolder = await t.sdkForConn.GET(
        '/unified/file-storage/files',
        {
          params: {query: {folder_id: testFolderId}},
        },
      )
      expect(Array.isArray(resWithFolder.data.items)).toBe(true)
      resWithFolder.data.items.forEach((file) => {
        expect(file.id).toBeTruthy()
        expect(file.name).toBeTruthy()
        expect(file.type).toBeTruthy()
        expect(typeof file.size).toBe('number')
        expect(file.raw_data).toBeTruthy()
        expect(Object.keys(file.raw_data).length).toBeGreaterThan(0)
      })
    }

    if (res.data.items.length > 0 && res.data.items[0]) {
      const file = res.data.items[0]
      testFileId = file.id
      expect(file.id).toBeTruthy()
      expect(file.name).toBeTruthy()
      expect(file.type).toBeTruthy()
      expect(typeof file.size).toBe('number')
      expect(typeof file.created_at).toBe('string')
      expect(typeof file.updated_at).toBe('string')
      expect(file.raw_data).toBeTruthy()
      expect(Object.keys(file.raw_data).length).toBeGreaterThan(0)
      console.log(
        `Test file ID set to: ${testFileId} ${file.name} ${file.type} ${
          file.size && file.size / 1024 / 1024
        } MB for ${t.adapterName} ${t.connectionId}`,
      )
    } else {
      throw new Error('No files found to use for testing')
    }
  })

  t.testIfImplemented('getFile', async () => {
    if (!testFileId) {
      console.warn('Skipping getFile test - no test file ID available')
      return
    }

    // Test valid file retrieval
    const res = await t.sdkForConn.GET('/unified/file-storage/files/{id}', {
      params: {path: {id: testFileId}},
    })
    expect(res.data).toBeTruthy()
    expect(res.data.id).toBe(testFileId)
    expect(res.data.name).toBeTruthy()
    expect(res.data.type).toBeTruthy()
    expect(typeof res.data.downloadable).toBe('boolean')
    expect(typeof res.data.size).toBe('number')
    expect(typeof res.data.created_at).toBe('string')
    expect(typeof res.data.updated_at).toBe('string')
    expect(res.data.raw_data).toBeTruthy()
    expect(Object.keys(res.data.raw_data).length).toBeGreaterThan(0)

    // Test invalid file ID
    await expect(
      t.sdkForConn.GET('/unified/file-storage/files/{id}', {
        params: {path: {id: 'invalid-file-id'}},
      }),
    ).rejects.toThrow(/Bad Request/)

    // Test with undefined ID
    await expect(
      t.sdkForConn.GET('/unified/file-storage/files/{id}', {
        params: {path: {id: 'undefined'}},
      }),
    ).rejects.toThrow(/Not Found/)
  })

  t.testIfImplemented('downloadFile', async () => {
    if (!testFileId) {
      console.warn('Skipping downloadFile test - no test file ID available')
      return
    }

    // First check if file is downloadable
    const fileInfo = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}',
      {
        params: {path: {id: testFileId}},
      },
    )

    if (!fileInfo.data.downloadable) {
      console.warn(
        `Skipping downloadFile test - file ${testFileId} is not downloadable`,
      )
      return
    }

    // Test valid file download
    const res = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}/download',
      {
        params: {path: {id: testFileId}},
        parseAs: 'blob',
      },
    )

    // const contentDisposition = res.response.headers.get('content-disposition')
    // const filename =
    //   contentDisposition?.split('filename=')[1]?.replace(/["']/g, '') ||
    //   `file-${testFileId}`

    // const blob = await res.data
    // const buffer = Buffer.from(await blob.arrayBuffer())
    // const fs = require('fs')
    // const path = require('path')
    // const downloadPath = path.join(filename)
    // fs.writeFileSync(downloadPath, buffer)
    // console.log(`File saved to: ${downloadPath}`)

    expect(res.data).toBeInstanceOf(Blob)

    // Test invalid file ID
    const response = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}/download',
      {
        params: {path: {id: 'invalid-file-id'}},
        parseAs: 'blob',
      },
    )

    expect(response.response.status).not.toBe(200)
  })

  t.testIfImplemented('exportFile', async () => {
    if (!testFileId) {
      console.warn('Skipping exportFile test - no test file ID available')
      return
    }

    // For SharePoint, expect export to not be implemented
    if (t.adapterName === 'microsoft') {
      await expect(
        t.sdkForConn.GET('/unified/file-storage/files/{id}/export', {
          params: {
            path: {id: testFileId},
            query: {format: 'pdf'},
          },
        }),
      ).rejects.toThrow(/not available in Sharepoint/)
      return
    }

    // Test PDF export for other adapters
    const resPdf = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}/export',
      {
        params: {
          path: {id: testFileId},
          query: {format: 'pdf'},
        },
        parseAs: 'blob',
      },
    )
    expect(resPdf.data).toBeInstanceOf(ReadableStream)

    // Test with invalid format
    await expect(
      t.sdkForConn.GET('/unified/file-storage/files/{id}/export', {
        params: {
          path: {id: testFileId},
          query: {format: 'invalid-format'},
        },
        parseAs: 'blob',
      }),
    ).rejects.toThrow()
  })

  t.testIfImplemented('listFolders', async () => {
    // Test default listing
    const res = await t.sdkForConn.GET('/unified/file-storage/folders', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)

    // Test with pagination
    const resWithPagination = await t.sdkForConn.GET(
      '/unified/file-storage/folders',
      {
        params: {query: {page_size: 5}},
      },
    )
    expect(resWithPagination.data.items.length).toBeLessThanOrEqual(5)

    // Test cursor-based pagination if we have items
    if (
      resWithPagination.data.items.length === 5 &&
      resWithPagination.data.next_cursor
    ) {
      const resWithCursor = await t.sdkForConn.GET(
        '/unified/file-storage/folders',
        {
          params: {
            query: {
              cursor: resWithPagination.data.next_cursor,
              page_size: 5,
            },
          },
        },
      )
      expect(resWithCursor.data.items).toBeTruthy()
      expect(Array.isArray(resWithCursor.data.items)).toBe(true)
    }

    if (res.data.items.length > 0 && res.data.items[0]) {
      const folder = res.data.items[0]
      testFolderId = folder.id
      expect(folder.id).toBeTruthy()
      expect(folder.name).toBeTruthy()
      expect(folder.path).toBeTruthy()
      expect(typeof folder.created_at).toBe('string')
      expect(typeof folder.updated_at).toBe('string')
      expect(folder.raw_data).toBeTruthy()
      expect(Object.keys(folder.raw_data).length).toBeGreaterThan(0)
    }

    // Test with driveId if available
    if (testDriveId) {
      const resWithDrive = await t.sdkForConn.GET(
        '/unified/file-storage/folders',
        {
          params: {query: {drive_id: testDriveId}},
        },
      )
      expect(Array.isArray(resWithDrive.data.items)).toBe(true)
    }
  })
})
