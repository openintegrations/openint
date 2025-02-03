/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable jest/no-standalone-expect */
import {getFixtureJson, testIf} from '@openint/vdk/vertical-test-utils'
import {unified} from '../../router'
import {mappers} from './mapper'

const accountFixture = getFixtureJson(__dirname, './__fixtures__/account.json')

testIf(accountFixture)('account', () => {
  const res = mappers.account(accountFixture)
  const out = unified.qboAccount.parse(res)
  expect(out).toBeTruthy()
})
