import Elysia from 'elysia'
import type {CustomerId, Viewer} from '@openint/cdk'
import {oauth2Schemas} from '@openint/cnext/_defaults/oauth2/def'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {createOAuth2Server} from '@openint/oauth2/OAuth2Server'
import {$test} from '@openint/util/__tests__/test-utils'
import type {Z} from '@openint/util/zod-utils'
import {getTestTRPCClient} from '../__tests__/test-utils'
import {trpc} from '../trpc/_base'
import {routerContextFromViewer} from '../trpc/context'
import {onError} from '../trpc/error-handling'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'

const logger = false

const router = trpc.mergeRouters(
  connectorConfigRouter,
  connectRouter,
  connectionRouter,
  eventRouter,
  customerRouter,
)

const configOauth = {
  client_id: 'client_222',
  client_secret: 'xxx',
  scopes: ['scope1', 'scope2'],
  redirect_uri: 'http://localhost:3000/connect/callback',
  // should contain whether server requires pkce
} satisfies Z.infer<typeof oauth2Schemas.connectorConfig>['oauth']

const oauth2Server = createOAuth2Server({
  clients: [
    {
      id: configOauth.client_id,
      name: configOauth.client_id,
      secret: configOauth.client_secret,
      redirectUris: [configOauth.redirect_uri],
      allowedGrants: [
        'authorization_code',
        'refresh_token',
        'client_credentials',
      ],
      scopes: configOauth.scopes.map((scope) => ({
        name: scope,
      })),
    },
  ],
  scopes: configOauth.scopes.map((scope) => ({name: scope})),
  users: [{id: 'user_222', username: 'user_222', password: 'xxx'}],
  authCodes: [],
})

const app = new Elysia().group('/oauth', (group) => group.use(oauth2Server))

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return router.createCaller(routerContextFromViewer({db, viewer}), {onError})
  }
  /** Also possible */
  function getClient(viewer: Viewer) {
    return getTestTRPCClient({db, router: connectorConfigRouter}, viewer)
  }
  const asOrg = getCaller({role: 'org', orgId: 'org_222'})
  const asUser = getCaller({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getCaller({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_222' as CustomerId,
  })
  // Tests linearly depend on each other for performance and simplicty

  const ccfgRes = $test('create connector config', async () => {
    const res = await asUser.createConnectorConfig({
      connector_name: 'dummy-oauth2',
      // TODO: Ensure discriminated union for this.
      config: {oauth: configOauth},
    })

    expect(res).toMatchObject({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'dummy-oauth2',
    })

    const parsed = oauth2Schemas.connectorConfig.parse(res.config)
    expect(parsed.oauth).toEqual(configOauth)

    return res
  })

  const preConnectRes = $test('preConnect', async () => {
    const res = await asCustomer.preConnect({
      id: ccfgRes.current.id,
      options: {},
      data: {
        connector_name: ccfgRes.current.connector_name,
        input: {},
      },
    })
    return oauth2Schemas.connectInput.parse(res.output)
  })

  $test('connect get 302 redirect', async () => {
    const request = new Request(preConnectRes.current.authorization_url, {
      redirect: 'manual',
    })
    const response = await app.handle(request)
    expect(response.status).toBe(302)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const url = new URL(response.headers.get('Location')!)
    expect(url.pathname).toBe('/connect/callback')
    const code = url.searchParams.get('code')
    expect(code).toBeDefined()
    const state = url.searchParams.get('state')
    expect(state).toBeDefined()
  })
})

/*

pre connect - get authorization url

connect - visit authorization url, get 302 redirect with code and state

post connect - exchange code for token 


*/
