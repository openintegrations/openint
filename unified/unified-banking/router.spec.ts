/* eslint-disable jest/no-standalone-expect */
import {forEachAdapterConnections} from '@openint/vdk/vertical-test-utils'
import adapters from './adapters'
import type {BankingAdapter} from './router'

forEachAdapterConnections<BankingAdapter<unknown>>(adapters, (t) => {
  t.testIfImplemented('listTransactions: non zero items', async () => {
    const res = await t.sdkForConn.GET('/unified/banking/transaction', {})
    expect(res.data.items).toBeTruthy()
    expect(res.data.items.length).toBeGreaterThan(0)
  })

  t.testIfImplemented('listAccounts', async () => {
    const res = await t.sdkForConn.GET('/unified/banking/account', {})
    expect(res.data.items).toBeTruthy()
  })

  t.testIfImplemented('listCategories', async () => {
    const res = await t.sdkForConn.GET('/unified/banking/category', {})
    expect(res.data.items).toBeTruthy()
  })

  t.testIfImplemented('listMerchants', async () => {
    const res = await t.sdkForConn.GET('/unified/banking/merchant', {})
    expect(res.data.items).toBeTruthy()
  })
})
