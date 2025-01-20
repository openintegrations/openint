/* eslint-disable jest/no-standalone-expect */
import {forEachAdapterConnections as describeEachAdapterConnections} from '@openint/vdk/vertical-test-utils'
import adapters from './adapters'
import type {FileStorageAdapter} from './router'

describeEachAdapterConnections<FileStorageAdapter<unknown>>(adapters, (t) => {
  let testFileId: string

  t.testIfImplemented('listDriveGroups', async () => {
    const res = await t.sdkForConn.GET('/unified/file-storage/drive-groups', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)
    if (res.data.items.length > 0) {
      // const group = res.data.items[0]
      // expect(group.id).toBeTruthy()
      // expect(group.name).toBeTruthy()
    }
  })

  t.testIfImplemented('listDrives', async () => {
    const res = await t.sdkForConn.GET('/unified/file-storage/drives', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)
    if (res.data.items.length > 0) {
      // const drive = res.data.items[0]
      // expect(drive.id).toBeTruthy()
      // expect(drive.name).toBeTruthy()
    }
  })

  t.testIfImplemented('listFiles', async () => {
    const res = await t.sdkForConn.GET('/unified/file-storage/files', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)
    if (res.data.items.length > 0) {
      // const file = res.data.items[0]
      // expect(file.id).toBeTruthy()
      // expect(file.name).toBeTruthy()
      // expect(file.type).toBeTruthy()
      // testFileId = file.id
    }
  })

  t.testIfImplemented('getFile', async () => {
    // Skip if we don't have a file ID from previous test
    if (!testFileId) {
      console.warn('Skipping getFile test - no test file ID available')
      return
    }

    const res = await t.sdkForConn.GET('/unified/file-storage/files/{id}', {
      params: {path: {id: testFileId}},
    })
    expect(res.data).toBeTruthy()
    expect(res.data.id).toBe(testFileId)
    expect(res.data.name).toBeTruthy()
    expect(res.data.type).toBeTruthy()
    expect(typeof res.data.downloadable).toBe('boolean')
  })

  t.testIfImplemented('exportFile', async () => {
    // Skip if we don't have a file ID from previous test
    if (!testFileId) {
      console.warn('Skipping exportFile test - no test file ID available')
      return
    }

    const res = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}/export',
      {
        params: {
          path: {id: testFileId},
          query: {format: 'pdf'}, // Common export format
        },
      },
    )
    expect(res.data).toBeTruthy()
    // Response should be a ReadableStream
    expect(res.data).toBeInstanceOf(ReadableStream)
  })

  t.testIfImplemented('downloadFile', async () => {
    // Skip if we don't have a file ID from previous test
    if (!testFileId) {
      console.warn('Skipping downloadFile test - no test file ID available')
      return
    }

    const res = await t.sdkForConn.GET(
      '/unified/file-storage/files/{id}/download',
      {
        params: {path: {id: testFileId}},
      },
    )
    expect(res.data).toBeTruthy()
    // Response should be a ReadableStream
    expect(res.data).toBeInstanceOf(ReadableStream)
  })

  t.testIfImplemented('listFolders', async () => {
    const res = await t.sdkForConn.GET('/unified/file-storage/folders', {})
    expect(res.data.items).toBeTruthy()
    expect(Array.isArray(res.data.items)).toBe(true)
    if (res.data.items.length > 0) {
      // const folder = res.data.items[0]
      // expect(folder.id).toBeTruthy()
      // expect(folder.name).toBeTruthy()
      // expect(folder.path).toBeTruthy()
    }
  })
})
