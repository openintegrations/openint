import fetchSync from 'sync-fetch'
import type {Id} from '@openint/cdk'
import {testEnv, testEnvRequired} from '@openint/env'
import {initOpenIntSDK} from '@openint/sdk'

// TODO: Allow this to test against local url with a db fork from remote
const API_URL = `${
  testEnv.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000'
}/api/c1`

function listConnections(apiUrl: string) {
  const sdk = initOpenIntSDK({headers: {'x-apikey': ''}})
  function _listConnections() {
    return sdk.GET('/core/connection').then((r) => r.data)
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

function getTestIfImplemented<TAdapterMethod extends string>(
  adapter: Partial<Record<TAdapterMethod, unknown>>,
) {
  type MethodInput = TAdapterMethod | `${TAdapterMethod}: ${string}`
  return (mi: MethodInput, fn: jest.ProvidesCallback) => {
    const method = mi.split(':')[0] as TAdapterMethod
    const name = method in adapter ? mi : `not implemented: ${mi}`
    const to = 30 * 1000 // 30 seconds
    return method in adapter ? test(name, fn, to) : test.skip(name, fn, to)
  }
}

// TODO: We need to seed the test db with dedicated connections from integration-tests org
export function forEachAdapterConnections<TAdapter>(
  adapters: Record<string, object>,
  fn: (ctx: {
    adapter: TAdapter
    adapterName: string
    connectionId: string
    sdkForConn: ReturnType<typeof initOpenIntSDK>
    testIfImplemented: ReturnType<
      typeof getTestIfImplemented<Extract<keyof TAdapter, string>>
    >
  }) => void,
) {
  const adapterNames = Object.keys(adapters)

  if (!adapterNames.length) {
    test.todo('No adapters configured')
  }

  const connections = listConnections(API_URL)

  describe.each(adapterNames)('adapter: %s', (adapterName) => {
    const conns = connections.filter((c) => c.connector_name === adapterName)
    if (conns.length === 0) {
      test.todo(`add connections for ${adapterName} to test`)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const adapter = adapters[adapterName]!

    const testIfImplemented = getTestIfImplemented<
      Extract<keyof TAdapter, string>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    >(adapter as any)

    describe.each(conns.map((c) => c.id))('connectionId: %s', (connId) => {
      const sdkForConn = initOpenIntSDK({
        headers: {
          'x-apikey': testEnvRequired.INTEGRATION_TEST_API_KEY,
          'x-connection-id': connId as Id['conn'],
        },
        baseUrl: API_URL,
      })
      fn({
        adapter: adapter as TAdapter,
        adapterName,
        connectionId: connId,
        sdkForConn,
        testIfImplemented,
      })
    })
  })
}

// maybe belongs in connector test utils?
export function getConnectionAndConfig() {
  // from testEnvVar?
  // from openInt server...
}
