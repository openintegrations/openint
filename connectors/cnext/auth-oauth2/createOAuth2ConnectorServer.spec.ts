import type {Z} from '@openint/util/zod-utils'

import {describe, expect, jest, test} from '@jest/globals'
import {makeId} from '@openint/cdk'
import {makeUlid} from '@openint/util/id-utils'
import {createOAuth2ConnectorServer} from './createOAuth2ConnectorServer'
import {oauth2Schemas, zOAuthConfigJson} from './schemas'

// Mock the client methods directly
const mockExchangeCodeForToken = jest
  .fn<() => Promise<{access_token: string; expires_in: number}>>()
  .mockResolvedValue({
    access_token: 'mock_access_token',
    expires_in: 3600,
  })

const mockRefreshToken = jest
  .fn<() => Promise<{access_token: string; expires_in: number}>>()
  .mockResolvedValue({
    access_token: 'refreshed_access_token',
    expires_in: 3600,
  })

const mockIntrospectToken = jest
  .fn<() => Promise<{active: boolean}>>()
  .mockResolvedValue({
    active: true,
  })

const mockRevokeToken = jest
  .fn<() => Promise<{active: boolean}>>()
  .mockResolvedValue({
    active: true,
  })

const mockGetAuthorizeUrl = jest
  .fn()
  .mockReturnValue('https://example.com/auth')

// Create a mock client
const mockClient = {
  config: {
    clientId: 'mock_client_id',
  },
  exchangeCodeForToken: mockExchangeCodeForToken,
  refreshToken: mockRefreshToken,
  introspectToken: mockIntrospectToken,
  revokeToken: mockRevokeToken,
  getAuthorizeUrl: mockGetAuthorizeUrl,
  joinScopes: (scopes: string[]) => scopes.join(' '),
}

// Mock the utils module
jest.mock('./utils', () => ({
  getClient: jest.fn().mockReturnValue(mockClient),
  getRequestedScopes: jest.fn().mockReturnValue(['scope1', 'scope2']),
}))

describe('createOAuth2ConnectorServer', () => {
  // Define test params for each API call
  const testParams = {
    authorize: {'authorize-param': 'authorize-value'},
    token: {'token-param': 'token-value'},
    refresh: {'refresh-param': 'refresh-value'},
    introspect: {'introspect-param': 'introspect-value'},
    revoke: {'revoke-param': 'revoke-value'},
  }

  // Create a connector definition
  const connectorDef = {
    name: 'acme-oauth2' as const,
    metadata: {
      authType: 'OAUTH2',
    },
    schemas: {
      ...oauth2Schemas,
      name: {_type: 'literal', value: 'acme-oauth2' as const},
    },
  }

  // OAuth config template
  const oauthConfigTemplate: Z.infer<typeof zOAuthConfigJson> = {
    type: 'OAUTH2',
    authorization_request_url: 'https://example.com/authorize',
    token_request_url: 'https://example.com/token',
    introspection_request_url: 'https://example.com/introspect',
    revocation_request_url: 'https://example.com/revoke',
    scopes: [],
    params_config: testParams,
  }

  // Create the server implementation
  const server = createOAuth2ConnectorServer(
    connectorDef as any,
    oauthConfigTemplate,
  )

  // Mock connection and config
  const mockSettings = {
    oauth: {
      credentials: {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    },
  }

  const mockConfig = {
    oauth: {
      client_id: 'test_client_id',
      client_secret: 'test_client_secret',
      scopes: ['scope1', 'scope2'],
    },
  }

  // Create instance for tests
  const instance = {
    client: mockClient,
    oauthConfig: oauthConfigTemplate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('preConnect passes correct authorization params', async () => {
    const res = await (server as any).preConnect({
      config: mockConfig,
      input: {},
      instance,
      context: {
        connectionExternalId: 'test-connection-id',
      },
    })

    expect(mockGetAuthorizeUrl).toHaveBeenCalledTimes(1)
    expect(mockGetAuthorizeUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        additional_params: testParams.authorize,
      }),
    )
    expect(res.authorization_url).toBeDefined()
  })

  test('postConnect passes correct token params', async () => {
    const connectOutput = {
      code: 'test_code',
      state: JSON.stringify({
        connection_id: makeId('conn', 'acme-oauth2', makeUlid()),
        redirect_uri: 'https://example.com/callback',
      }),
    }

    await (server as any).postConnect({
      connectOutput,
      config: mockConfig,
      instance,
    })

    expect(mockExchangeCodeForToken).toHaveBeenCalledTimes(1)
    expect(mockExchangeCodeForToken).toHaveBeenCalledWith(
      expect.objectContaining({
        additional_params: testParams.token,
      }),
    )
  })

  test('checkConnection passes correct refresh params when refreshing token', async () => {
    // Set token to be expired
    const expiredSettings = {
      ...mockSettings,
      oauth: {
        ...mockSettings.oauth,
        credentials: {
          ...mockSettings.oauth.credentials,
          expires_at: new Date(Date.now() - 1000).toISOString(),
        },
      },
    }

    await (server as any).checkConnection({
      settings: expiredSettings,
      config: mockConfig,
      instance,
    })

    expect(mockRefreshToken).toHaveBeenCalledTimes(1)
    expect(mockRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        additional_params: testParams.refresh,
      }),
    )
  })

  test('checkConnection passes correct introspection params', async () => {
    // Make sure token is not expired to trigger introspection
    const validSettings = {
      ...mockSettings,
      oauth: {
        ...mockSettings.oauth,
        credentials: {
          ...mockSettings.oauth.credentials,
          expires_at: new Date(Date.now() + 1000000).toISOString(),
          // NOTE: Currently introspection is not called unless the access token is NOT expired AND refresh token does not exist,
          // !refreshToken & access_token & isExpired & introspectUrlExists this will ALWAYS throw an error instead of just trying the introspection URL, which I'm not sure if accurate.
          refresh_token: undefined,
        },
      },
    }

    await (server as any).checkConnection({
      settings: validSettings,
      config: mockConfig,
      instance,
    })

    expect(mockIntrospectToken).toHaveBeenCalledTimes(1)
    expect(mockIntrospectToken).toHaveBeenCalledWith(
      expect.objectContaining({
        additional_params: testParams.introspect,
      }),
    )
  })

  test('revokeConnection passes correct revoke params', async () => {
    await (server as any).revokeConnection({
      settings: mockSettings,
      instance,
    })

    expect(mockRevokeToken).toHaveBeenCalledTimes(1)
    expect(mockRevokeToken).toHaveBeenCalledWith(
      expect.objectContaining({
        additional_params: testParams.revoke,
      }),
    )
  })
})
