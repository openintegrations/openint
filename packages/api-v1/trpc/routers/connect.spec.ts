import type {CustomerId, Viewer} from '@openint/cdk'
import type {OAuthConnectorConfig} from '@openint/cnext/auth-oauth2/schemas'

import Elysia from 'elysia'
import {extractId, Id} from '@openint/cdk'
import {oauth2Schemas, zOauthState} from '@openint/cnext/auth-oauth2/schemas'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {env} from '@openint/env'
import {createOAuth2Server} from '@openint/oauth2/createOAuth2Server'
import {$test} from '@openint/util/__tests__/test-utils'
import {safeJSONParse} from '@openint/util/json-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {trpc} from '../_base'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
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

const oauthConfigs = {
  default: {
    client_id: 'client_111',
    client_secret: '864076C6-7D1D-43DE-BBA9-D257E7EB06B5',
    scopes: ['read:user', 'write:org'],
  },
  customRedirect: {
    client_id: 'client_222',
    client_secret: 'xxx',
    scopes: ['scope1', 'scope2'],
    redirect_uri: 'https://openint.mydomain.com/connect/callback',
  },
} satisfies Record<string, OAuthConnectorConfig>

const _oauth2Server = createOAuth2Server({
  clients: Object.values(oauthConfigs).map((config) => ({
    id: config.client_id,
    name: config.client_id,
    secret: config.client_secret,
    redirectUris: [
      (config as OAuthConnectorConfig).redirect_uri?.trim() ||
        env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY,
    ],
    allowedGrants: [
      'authorization_code',
      'refresh_token',
      'client_credentials',
    ],
    scopes: config.scopes.map((scope) => ({
      name: scope,
    })),
  })),

  scopes: Object.values(oauthConfigs).flatMap((config) =>
    config.scopes.map((scope) => ({name: scope})),
  ),
  users: [{id: 'user_222', username: 'user_222', password: 'xxx'}],
  authCodes: [],
})

const oauth2Server = new Elysia({prefix: '/api/acme-oauth2'}).use(_oauth2Server)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return router.createCaller(
      // inject oauth2Server.handle as fetch for the code exchange later
      routerContextFromViewer({db, viewer, fetch: oauth2Server.handle}),
      {onError},
    )
  }
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

  const describeMaybeOnly =
    process.env['TEST'] === 'oauth2' ? describe.only : describe

  describeMaybeOnly.each(Object.keys(oauthConfigs))('oauth2 %s', (key) => {
    // Only run one when limiting ourselvses
    if (process.env['TEST'] === 'oauth2' && key !== 'default') {
      return
    }
    const oauthConfig: OAuthConnectorConfig =
      oauthConfigs[key as keyof typeof oauthConfigs]
    const redirectUri =
      oauthConfig.redirect_uri?.trim() ||
      env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY

    const ccfgRes = $test('create connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'acme-oauth2',
        // TODO: Ensure discriminated union for this.
        config: {oauth: oauthConfig},
      })

      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'acme-oauth2',
      })

      const parsed = oauth2Schemas.connector_config.parse(res.config)
      expect(parsed.oauth).toEqual(oauthConfig)

      return res
    })

    const preConnectRes = $test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {},
        },
      })
      const parsed = oauth2Schemas.connect_input.parse(res.connect_input)
      const authorizationUrl = new URL(parsed.authorization_url)
      const state = zOauthState.parse(
        safeJSONParse(authorizationUrl.searchParams.get('state')),
      )
      expect(authorizationUrl.searchParams.get('redirect_uri')).toEqual(
        redirectUri,
      )
      return {...parsed, state}
    })

    const connectRes = $test('connect get 302 redirect', async () => {
      const request = new Request(preConnectRes.current.authorization_url, {
        redirect: 'manual',
      })
      const response = await oauth2Server.handle(request)
      expect(response.status).toBe(302)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const url = new URL(response.headers.get('Location')!)
      expect(url.toString()).toContain(redirectUri)

      return oauth2Schemas.connect_output.parse({
        ...urlSearchParamsToJson(url.searchParams),
        code_verifier: preConnectRes.current.code_verifier,
      })
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: connectRes.current,
        },
      })

      const settings = oauth2Schemas.connection_settings.parse(res.settings)
      expect(res.status).toBe('healthy')
      expect(res.status_message).toBeNull()
      expect(res.customer_id).toBe('cus_222')
      expect(res.id).toEqual(preConnectRes.current.state.connection_id)
      expect(settings.oauth.credentials?.expires_in).toBeDefined()
      expect(settings.oauth.credentials?.expires_at).toBeDefined()
      // adding this if to satisfy the type checker
      if (settings.oauth.credentials?.expires_in) {
        const expiresAt = new Date(
          settings.oauth.credentials.expires_at as string,
        )
        const expectedExpiresAt = new Date(
          Date.now() + settings.oauth.credentials.expires_in * 1000,
        )

        // Check that expires_at is a date in the future
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now())

        // Check that expires_at equals updated_at plus expires_in (with small tolerance for test execution time)
        expect(
          Math.abs(expiresAt.getTime() - expectedExpiresAt.getTime()),
        ).toBeLessThan(1000)
      } else {
        throw new Error(
          'Oauth expires_in is not defined. Failure at connect.spec.ts',
        )
      }

      const events = await asUser.listEvents()
      const recentEvent = events.items.find(
        (e) => e.name === 'connect.connection-connected',
      )

      expect(recentEvent).toBeDefined()
      expect(recentEvent?.data?.connection_id).toBe(res.id)

      return {id: res.id, settings}
    })

    // use access token to do something useful, like introspect
    test('introspect token', async () => {
      const res = await oauth2Server.handle(
        new Request('http://localhost/api/acme-oauth2/token/introspect', {
          method: 'POST',
          body: new URLSearchParams({
            token:
              postConnectRes.current.settings.oauth.credentials!.access_token,
            client_id: oauthConfig.client_id!,
            client_secret: oauthConfig.client_secret!,
          }),
        }),
      )
      const json = await res.json()
      expect(json.active).toBe(true)
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
        include_secrets: true,
      })
      expect(res.settings).toEqual(postConnectRes.current.settings)
      expect(res.status).toBe('healthy')
      expect(res.status_message).toBeNull()
    })

    test('check connection', async () => {
      const res = await asCustomer.checkConnection({
        id: postConnectRes.current.id,
      })
      expect(res.status).toBe('healthy')
      expect(res.status_message).toBeNull()
      // TODO: Check if we used introspection or refresh token as part of check connection
    })

    // Simulate expiration
    test('revoke connection', async () => {
      const revokeRes = await asCustomer.revokeConnection({
        id: postConnectRes.current.id,
      })
      expect(revokeRes).toMatchObject({id: postConnectRes.current.id})
      expect(revokeRes.status).toBe('disconnected')
      expect(revokeRes.status_message).toBe(
        'Connection was revoked via OpenInt',
      )

      const res = await asCustomer.checkConnection({
        id: postConnectRes.current.id,
      })
      // TODO: Do we need an `outdated` status to distinguish between revoked and expired?
      expect(res.status).toBe('disconnected')
      // TODO: Fix the error here...
      expect(res.status_message).toBe('Connection was revoked via OpenInt')
    })

    // Reconnect
    const rePreConnectRes = $test('reconnect: preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {
          connectionExternalId: extractId(
            postConnectRes.current.id as Id['conn'],
          )[2],
        },
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {},
        },
      })
      const parsed = oauth2Schemas.connect_input.parse(res.connect_input)
      const authorizationUrl = new URL(parsed.authorization_url)
      const state = zOauthState.parse(
        safeJSONParse(authorizationUrl.searchParams.get('state')),
      )
      expect(authorizationUrl.searchParams.get('redirect_uri')).toEqual(
        redirectUri,
      )
      expect(state.connection_id).toEqual(postConnectRes.current.id)
      return {...parsed, state}
    })

    const reConnectRes = $test(
      'reconnect: connect get 302 redirect',
      async () => {
        const request = new Request(rePreConnectRes.current.authorization_url, {
          redirect: 'manual',
        })
        const response = await oauth2Server.handle(request)
        expect(response.status).toBe(302)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = new URL(response.headers.get('Location')!)
        expect(url.toString()).toContain(redirectUri)

        return oauth2Schemas.connect_output.parse({
          ...urlSearchParamsToJson(url.searchParams),
          code_verifier: rePreConnectRes.current.code_verifier,
        })
      },
    )

    $test('reconnect: postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: reConnectRes.current,
        },
      })

      const settings = oauth2Schemas.connection_settings.parse(res.settings)
      expect(res.status).toBe('healthy')
      expect(res.status_message).toBeNull()
      expect(res.customer_id).toBe('cus_222')
      expect(res.id).toEqual(rePreConnectRes.current.state.connection_id)

      const events = await asUser.listEvents()
      const recentEvent = events.items.find(
        (e) => e.name === 'connect.connection-connected',
      )

      expect(recentEvent).toBeDefined()
      expect(recentEvent?.data?.connection_id).toBe(res.id)

      return {id: res.id, settings}
    })
  })

  // MARK: - APIKEY BASED AUTH

  describe('apikey based auth', () => {
    const settings = {apiKey: 'key-123'}

    // TODO: create a dummy apikey based connector instead
    const ccfgRes = $test('create connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'greenhouse',
        config: {},
      })
      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'greenhouse',
      })
      return res
    })

    // Not needed really, does not actually even get implemented
    test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {},
        },
      })
      expect(res.connect_input).toEqual({})
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: settings,
        },
      })
      expect(res.settings).toEqual(settings)
      return res
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
        include_secrets: true,
      })
      expect(res.settings).toEqual(settings)
    })

    test.todo('check connection')

    test.todo('revoke connection')

    test.todo('handle status update after external revoke')
  })

  // MARK: - CUSTOM AUTH

  describe('custom auth', () => {
    const ccfgRes = $test('create plaid connector config', async () => {
      const res = await asUser.createConnectorConfig({
        connector_name: 'plaid',
        config: {
          envName: 'sandbox',
          clientName: 'Test Client',
          products: ['transactions'],
          countryCodes: ['US'],
          language: 'en',
          credentials: null,
        },
      })
      expect(res).toMatchObject({
        id: expect.any(String),
        org_id: 'org_222',
        connector_name: 'plaid',
      })
      return res
    })

    const preConnectRes = $test('preConnect', async () => {
      const res = await asCustomer.preConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          pre_connect_input: {sandboxPublicTokenCreate: true},
        },
      })
      // TODO: Use plaid schema to parse here.
      expect(res.connect_input).toEqual({public_token: expect.any(String)})
      return res
    })

    const postConnectRes = $test('postConnect', async () => {
      const res = await asCustomer.postConnect({
        connector_config_id: ccfgRes.current.id,
        options: {},
        discriminated_data: {
          connector_name: ccfgRes.current.connector_name,
          connect_output: preConnectRes.current.connect_input,
        },
      })
      // expect(res.status).toBe('healthy')
      // expect(res.status_message).toBeNull()

      return res
    })

    test('get connection', async () => {
      const res = await asCustomer.getConnection({
        id: postConnectRes.current.id,
        include_secrets: true,
      })
      expect(res.settings).toEqual(postConnectRes.current.settings)
    })

    test('check connection', async () => {
      const res = await asCustomer.checkConnection({
        id: postConnectRes.current.id,
      })
      expect(res.status).toBeNull()
      expect(res.status_message).toBeNull()
    })

    test('revoke connection', async () => {
      const res = await asCustomer.revokeConnection({
        id: postConnectRes.current.id,
      })
      expect(res).toMatchObject({
        id: postConnectRes.current.id,
      })
      // TODO: Check connection settings
    })

    test.todo('handle status update after external revoke')
  })
})

/*

pre connect - get authorization url

connect - visit authorization url, get 302 redirect with code and state
return the needed data to the client via popup

post connect - exchange code for token 


*/
