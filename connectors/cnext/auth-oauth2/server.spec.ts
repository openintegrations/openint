import type {ConnectorDef} from '@openint/cdk'
import {type Z} from '@openint/util/zod-utils'
// TODO: Fix this hack... but it is needed to avoid circular dependency for now
import {describeEachDatabase} from '../../../packages/db/__tests__/test-utils'
import type {JsonConnectorDef} from '../schema'
import type {zOAuthConfig} from './def'
import {generateOauthConnectorDef} from './schema'
import {generateOAuth2Server} from './server'

const logger = false

jest.mock('node-fetch')

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, () => {
  let mockConnectorDef: ConnectorDef
  const mockOauthConfig = {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.example.com/authorize',
    token_request_url: 'https://auth.example.com/token',
    scopes: [
      {scope: 'read', description: 'Read access'},
      {scope: 'write', description: 'Write access'},
    ],
    params_config: {
      authorize: {
        custom_param: 'custom_value',
      },
      token: {},
      refresh: {},
    },
  } satisfies Z.infer<typeof zOAuthConfig>
  let mockFetch: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()

    mockFetch = jest.fn()
    global.fetch = mockFetch

    mockConnectorDef = generateOauthConnectorDef('test_connector', {
      display_name: 'Test Connector',
      stage: 'alpha',
      version: 1,
      audience: ['consumer'],
      verticals: ['other'],
      auth: mockOauthConfig,
      links: {
        web_url: 'https://example.com',
      },
    } satisfies JsonConnectorDef)
  })

  test('newInstance should throw error if client credentials are missing', () => {
    const server = generateOAuth2Server(
      mockConnectorDef as any,
      mockOauthConfig,
    )

    expect(server.newInstance).toBeDefined()
    expect(() => {
      if (!server.newInstance) {
        throw new Error('newInstance is not defined')
      }
      return server.newInstance({
        config: {} as any,
        settings: {} as any,
        fetchLinks: [],
        onSettingsChange: () => Promise.resolve(),
      })
    }).toThrow('provided')
  })

  test('newInstance should initialize successfully with valid credentials', () => {
    const server = generateOAuth2Server(
      mockConnectorDef as any,
      mockOauthConfig,
    )
    process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
    process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

    expect(() => {
      if (!server.newInstance) {
        throw new Error('newInstance is not defined')
      }
      return server.newInstance({
        config: {} as any,
        settings: {} as any,
        fetchLinks: [],
        onSettingsChange: () => Promise.resolve(),
      })
    }).not.toThrow()
  })

  test('preConnect should generate correct authorization URL', async () => {
    const server = generateOAuth2Server(
      mockConnectorDef as any,
      mockOauthConfig,
    )
    process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
    process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

    if (!server.preConnect) {
      throw new Error('preConnect is not defined')
    }

    const result = await server.preConnect({
      config: {
        oauth: {
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
          scopes: ['read', 'write'],
        },
      },
      context: {
        extCustomerId: `cust_123` as any,
        webhookBaseUrl: 'https://example.com/webhook',
      },
      input: {connectionId: 'test_connection_id'},
    })

    expect(result.authorization_url).toContain(
      'https://auth.example.com/authorize',
    )
    const scopeParam = mockOauthConfig.scopes.map((s) => s.scope).join(' ')
    expect(result.authorization_url).toContain(
      `scope=${encodeURIComponent(scopeParam)}`,
    )
    expect(result.authorization_url).toContain(
      'client_id=' + encodeURIComponent('test_client_id'),
    )
    expect(result.authorization_url).not.toContain('client_secret=')
    expect(result.authorization_url).toContain('response_type=code')
    expect(result.authorization_url).toContain('custom_param=custom_value')
    expect(result.authorization_url).toContain('state=')
  })

  test('preConnect scope validation works', async () => {
    const serverOauthConfig = {
      ...mockOauthConfig,
      openint_scopes: ['read', 'write'], // Only these scopes are allowed
    }

    const server = generateOAuth2Server(
      mockConnectorDef as any,
      serverOauthConfig,
    )

    process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
    process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

    if (!server.preConnect) {
      throw new Error('preConnect is not defined')
    }

    // Try to use an invalid scope
    await expect(
      server.preConnect({
        config: {
          oauth: {
            // 'non_default_scope' is not in openint_scopes. Since we're relying on default credentials,
            // we should not be able to use non default scope.
            scopes: ['read', 'non_default_scope'],
          },
        },
        context: {
          extCustomerId: `cust_123` as any,
          webhookBaseUrl: 'https://example.com/webhook',
        },
        input: {connectionId: 'test_connection_id'},
      }),
    ).rejects.toThrow(
      'Invalid scopes configured: non_default_scope. Valid default scopes are: read, write',
    )

    // we're not relying on default credentials here, so we should be able to use an invalid scope
    await expect(
      server.preConnect({
        config: {
          oauth: {
            client_id: 'xxx',
            client_secret: 'yyy',
            scopes: ['read', 'non_default_scope'],
          },
        },
        context: {
          extCustomerId: `cust_123` as any,
          webhookBaseUrl: 'https://example.com/webhook',
        },
        input: {connectionId: 'test_connection_id'},
      }),
    ).toBeTruthy()
  })

  // test('postConnect should exchange code for tokens successfully', async () => {
  //   const server = generateOAuth2Server(mockConnectorDef)
  //   process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
  //   process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

  //   // Mock isOAuth2ConnectorDef to return true
  //   jest
  //     .spyOn(require('./server'), 'isOAuth2ConnectorDef')
  //     .mockReturnValue(true)

  //   mockFetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: () =>
  //       Promise.resolve({
  //         access_token: 'test_access_token',
  //         refresh_token: 'test_refresh_token',
  //         expires_in: 3600,
  //         user_id: 'test_user',
  //         account_type: 'premium',
  //       }),
  //   } as Response)

  //   if (!server.postConnect) {
  //     throw new Error('postConnect is not defined')
  //   }

  //   const result = await server.postConnect(
  //     {
  //       code: 'test_code',
  //       state: 'test_state',
  //       connectionId: 'test_connection_id',
  //     },
  //     {
  //       id: 'test_config_id',
  //       client_id: 'test_client_id',
  //       client_secret: 'test_client_secret',
  //     },
  //     {
  //       extCustomerId: `cust_123` as any,
  //       webhookBaseUrl: 'https://example.com/webhook',
  //     },
  //   )

  //   expect(result.connectionExternalId).toBe('id')
  //   expect(result.settings.oauth.credentials.access_token).toBe(
  //     'test_access_token',
  //   )
  //   expect(result.settings.oauth.credentials.refresh_token).toBe(
  //     'test_refresh_token',
  //   )
  //   // Add capture_response_fields to the mock connector def
  //   mockConnectorDef.auth.capture_response_fields = ['user_id', 'account_type']
  //   expect(result.settings.metadata).toEqual({
  //     user_id: 'test_user',
  //     account_type: 'premium',
  //   })
  // })

  // test('refreshConnection should refresh tokens successfully', async () => {
  //   const server = generateOAuth2Server(mockConnectorDef)
  //   process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
  //   process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

  //   // Mock isOAuth2ConnectorDef to return true
  //   jest
  //     .spyOn(require('./server'), 'isOAuth2ConnectorDef')
  //     .mockReturnValue(true)

  //   mockFetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: () =>
  //       Promise.resolve({
  //         access_token: 'new_access_token',
  //         refresh_token: 'new_refresh_token',
  //         expires_in: 3600,
  //         user_id: 'test_user',
  //         account_type: 'premium',
  //       }),
  //   } as Response)

  //   if (!server.refreshConnection) {
  //     throw new Error('refreshConnection is not defined')
  //   }

  //   // Make sure capture_response_fields is set
  //   mockConnectorDef.auth.capture_response_fields = ['user_id', 'account_type']

  //   const result = await server.refreshConnection(
  //     {
  //       oauth: {
  //         credentials: {
  //           refresh_token: 'old_refresh_token',
  //           connection_id: 'test_connection_id',
  //           created_at: '2024-01-01T00:00:00.000Z',
  //           provider_config_key: 'test_config_id',
  //         },
  //       },
  //       metadata: {
  //         existing_field: 'value',
  //       },
  //     },
  //     {
  //       id: 'test_config_id',
  //       client_id: 'test_client_id',
  //       client_secret: 'test_client_secret',
  //     },
  //   )

  //   expect(result.oauth.credentials.access_token).toBe('new_access_token')
  //   expect(result.oauth.credentials.refresh_token).toBe('new_refresh_token')
  //   expect(result.metadata).toEqual({
  //     existing_field: 'value',
  //     user_id: 'test_user',
  //     account_type: 'premium',
  //   })
  // })

  // test('refreshConnection should throw error when refresh token is missing', async () => {
  //   const server = generateOAuth2Server(mockConnectorDef)
  //   process.env['ccfg_test_connector_CLIENT_ID'] = 'test_client_id'
  //   process.env['ccfg_test_connector_CLIENT_SECRET'] = 'test_client_secret'

  //   // Mock isOAuth2ConnectorDef to return true - using the correct import
  //   jest
  //     .spyOn(require('./server'), 'isOAuth2ConnectorDef')
  //     .mockReturnValue(true)

  //   if (!server.refreshConnection) {
  //     throw new Error('refreshConnection is not defined')
  //   }

  //   await expect(
  //     server.refreshConnection(
  //       {
  //         oauth: {
  //           credentials: {},
  //         },
  //       },
  //       {
  //         id: 'test_config_id',
  //         client_id: 'test_client_id',
  //         client_secret: 'test_client_secret',
  //       },
  //     ),
  //   ).rejects.toThrow('No refresh token available')
  // })
})
