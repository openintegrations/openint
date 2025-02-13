/* eslint-disable jest/no-standalone-expect */
import {forEachAdapterConnections} from '@openint/vdk/vertical-test-utils'
import adapters from './adapters'
import type {AccountingAdapter} from './router'

forEachAdapterConnections<AccountingAdapter<unknown>>(adapters, (t) => {
  t.testIfImplemented('getTransactionList', async () => {
    const res = await t.sdkForConn.GET('/unified/accounting/transaction-list', {
      params: {
        query: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          // limit: 10,
          // offset: 0,
        },
      },
    })
    expect(res.data).toBeTruthy()
  })
})
