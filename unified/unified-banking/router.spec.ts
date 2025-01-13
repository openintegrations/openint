/* eslint-disable jest/no-standalone-expect */
import fetchSync from 'sync-fetch'
import type {Id} from '@openint/cdk'
import {testEnvRequired} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'
import adapters from './adapters'

// TODO: Allow this to test against local url with a db fork from remote
const apiUrl = 'https://app.openint.dev/api/v0'

function listConnections() {
  function _listConnections() {
    return sdkAsOrg.GET('/core/connection').then((r) => r.data)
  }

  // Workaround jest not supporting synchronous tests
  // Perhaps SDK should support some type of synchronous calls as well? Maybe via the form of a cli?
  // Already tried deasync.js but it did not seem to work and just causes hanging.
  const res = fetchSync(`${apiUrl}/core/connection`, {
    headers: {'x-apikey': testEnvRequired.INTEGRATION_TEST_API_KEY},
  })
  if (res.status === 200) {
    return res.json() as Awaited<ReturnType<typeof _listConnections>>
  }
  throw new Error(`Failed to list connections: ${res.text()}`)
}

const sdkAsOrg = initOpenIntSDK({
  headers: {'x-apikey': testEnvRequired.INTEGRATION_TEST_API_KEY},
  baseUrl: apiUrl,
})

const connections = listConnections()

const testIfImplemented: typeof test = ((name, fn, timeout) => {
  const wrapped = async (...args: unknown[]) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return await fn!(...(args as [jest.DoneCallback]))
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 501) {
        console.warn('Skip not implemented:', name)
        return
      }
      throw err
    }
  }
  // eslint-disable-next-line jest/valid-title, jest-formatting/padding-around-test-blocks
  test(name, fn ? wrapped : fn, timeout)
}) as typeof test

describe.each(Object.keys(adapters))('adapter: %s', (adapterName) => {
  const conns = connections.filter((c) => c.connectorName === adapterName)
  if (conns.length === 0) {
    return
  }

  describe.each(conns.map((c) => c.id))('connId: %s', (connId) => {
    const sdkForConn = initOpenIntSDK({
      headers: {
        'x-apikey': testEnvRequired.INTEGRATION_TEST_API_KEY,
        'x-connection-id': connId as Id['conn'],
      },
      baseUrl: apiUrl,
    })

    testIfImplemented('listTransactions', async () => {
      const res = await sdkForConn.GET('/unified/banking/transaction', {})
      expect(res.data.items).toBeTruthy()
    })

    testIfImplemented('listAccounts', async () => {
      const res = await sdkForConn.GET('/unified/banking/account', {})
      expect(res.data.items).toBeTruthy()
    })

    testIfImplemented('listCategories', async () => {
      const res = await sdkForConn.GET('/unified/banking/category', {})
      expect(res.data.items).toBeTruthy()
    })

    testIfImplemented('listMerchants', async () => {
      const res = await sdkForConn.GET('/unified/banking/merchant', {})
      expect(res.data.items).toBeTruthy()
    })
  })
})
