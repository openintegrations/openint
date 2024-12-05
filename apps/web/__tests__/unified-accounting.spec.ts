/* eslint-disable jest/no-standalone-expect */
import type {EndUserId} from '@openint/cdk'
import {initOpenIntSDK} from '@openint/sdk'

jest.setTimeout(30 * 1000) // long timeout because we have to wait for next.js to compile

const openint = initOpenIntSDK({
  headers: {
    'x-apikey': process.env['OPENINT_API_KEY'],
    'x-resource-end-user-id':
      (process.env['OPENINT_END_USER_ID'] as EndUserId) ?? undefined,
  },
  baseUrl: process.env['OPENINT_API_URL'],
})

const maybeTest = process.env['OPENINT_API_KEY'] ? test : test.skip

maybeTest('/unified/account', async () => {
  const res = await openint.GET('/unified/accounting/transaction-list')
  console.log(res.data)
  expect(res.response.status).toBe(200)
})
