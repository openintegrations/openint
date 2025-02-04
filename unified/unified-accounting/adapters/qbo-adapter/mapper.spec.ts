/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable jest/no-standalone-expect */
import {getFixtureJson, testIf} from '@openint/vdk/vertical-test-utils'
import {unified} from '../../router'
import {mappers} from './mapper'

const transactionList = getFixtureJson(
  __dirname,
  './__fixtures__/transaction-list.json',
)

testIf(transactionList)('transaction-list', () => {
  const res = mappers.transactionList({data: transactionList})
  const out = unified.transactionList.parse(res)
  expect(out).toBeTruthy()
})
