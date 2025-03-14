import type {Id} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util'
import {createApp} from '../app'

const testApiKey = `apikey_${makeUlid()}`
const testOrgId = `org_${makeUlid()}` as Id['org']

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  let app: ReturnType<typeof createApp>

  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: testOrgId,
      api_key: testApiKey,
    })

    await db.insert(schema.connector_config).values({
      id: `ccfg_google_${makeUlid()}`,
      org_id: testOrgId,
      config: {
        oauth: {
          client_id: 'client_222',
          client_secret: 'xxx',
          scopes:
            'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly',
        },
        integrations: {
          drive: {
            enabled: true,
            scopes: 'https://www.googleapis.com/auth/drive',
          },
          gmail: {
            enabled: false,
            scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          },
        },
      },
      display_name: 'Test Google Connection',
      disabled: false,
      metadata: {
        createdBy: 'test-suite',
        version: '1.0',
      },
    })
    app = createApp({db})
  })

  test('GET /connector-config with expand options array', async () => {
    const headers = new Headers()
    headers.set('authorization', `Bearer ${testApiKey}`)
    headers.set('accept', 'application/json')

    const url = new URL('http://localhost/api/v1/connector-config')
    url.searchParams.set('expand', 'enabled_integrations,connector')

    const req = new Request(url, {headers})

    const response = await app.handle(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toBeTruthy()

    const items = result.items || []

    expect(items[0].integrations).toEqual({
      drive: {
        enabled: true,
        scopes: 'https://www.googleapis.com/auth/drive',
      },
    })
    expect(items[0].connector).toEqual({
      name: 'google',
      logo_url:
        'https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public//_assets/logo-google.svg',
    })
  })

  test('GET /connector-config with invalid expand options', async () => {
    const headers = new Headers()
    headers.set('authorization', `Bearer ${testApiKey}`)
    headers.set('accept', 'application/json')

    const url = new URL('http://localhost/api/v1/connector-config')
    url.searchParams.set('expand', 'foo')

    const req = new Request(url, {headers})

    const response = await app.handle(req)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.issues[0].message).toEqual(
      'Invalid expand option. Valid options are: connector, enabled_integrations, connection_count',
    )
  })
})
