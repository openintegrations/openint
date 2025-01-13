/* eslint-disable jest/no-standalone-expect */
import {forEachAdapterConnections as describeEachAdapterConnections} from '@openint/vdk/vertical-test-utils'
import adapters from './adapters'
import type {FileStorageAdapter} from './router'

describeEachAdapterConnections<FileStorageAdapter<unknown>>(adapters, (t) => {
  let driveId: string

  t.testIfImplemented('listDrives', async () => {
    const res = await t.sdkForConn.GET('/unified/file-storage/drive', {})
    expect(res.data.items).toBeTruthy()
    expect(res.data.items.length).toBeGreaterThan(0)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    driveId = res.data.items[0]!.id
    expect(driveId).toBeTruthy()
  })

  t.testIfImplemented('listFolders', async () => {
    const res = await t.sdkForConn.GET(
      '/unified/file-storage/drive/{driveId}/folder',
      {params: {path: {driveId}}},
    )
    expect(res.data.items).toBeTruthy()
  })

  t.testIfImplemented('listFiles', async () => {
    const res = await t.sdkForConn.GET(
      '/unified/file-storage/drive/{driveId}/file',
      {params: {path: {driveId}}},
    )
    expect(res.data.items).toBeTruthy()
  })
})
