import type {Z} from '@openint/util/zod-utils'
import type {zOAuthConfig} from './def'
import {prepareScopes, renameObjectKeys} from './utils'

test('Scope separator should work correctly for different delimiters', () => {
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

  const scopesWithDefaultSpaceSeparator = mockOauthConfig.scopes
    .map((s) => s.scope)
    .join(' ')
  expect(
    prepareScopes(
      mockOauthConfig.scopes.map((s) => s.scope),
      mockOauthConfig,
    ),
  ).toBe(encodeURIComponent(scopesWithDefaultSpaceSeparator))

  const scopesWithCommaSeparator = mockOauthConfig.scopes
    .map((s) => s.scope)
    .join(',')
  expect(
    prepareScopes(
      mockOauthConfig.scopes.map((s) => s.scope),
      {...mockOauthConfig, scope_separator: ','},
    ),
  ).toBe(encodeURIComponent(scopesWithCommaSeparator))
})

describe('renameObjectKeys', () => {
  test('should map parameters according to paramNames', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      scope: 'read',
    }

    const paramNames = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
      scope: 'scopes',
    }

    const result = renameObjectKeys(params, paramNames)

    expect(result).toEqual({
      clientKey: 'test-client-id',
      clientSecret: 'test-client-secret',
      scopes: 'read',
    })
  })

  test('should handle empty params', () => {
    const params = {}
    const paramNames = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
    }

    const result = renameObjectKeys(params, paramNames)

    expect(result).toEqual({})
  })

  test('should handle empty paramNames', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
    }
    const paramNames = {}

    const result = renameObjectKeys(params, paramNames)

    // With empty paramNames, we expect the original params to be returned unchanged
    expect(result).toEqual({
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
    })
  })

  test('should keep parameters that are not in paramNames', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      redirect_uri: 'https://example.com/callback',
      state: 'random-state',
    }

    const paramNames = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
    }

    const result = renameObjectKeys(params, paramNames)

    // Parameters with mappings should be renamed, others should remain unchanged
    expect(result).toEqual({
      clientKey: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirect_uri: 'https://example.com/callback',
      state: 'random-state',
    })
  })

  test('should handle Salesforce-like parameter mapping', () => {
    const params = {
      client_id: 'salesforce-client-id',
      client_secret: 'salesforce-client-secret',
      scope: 'api',
    }

    const paramNames = {
      client_id: 'consumer_key',
      client_secret: 'consumer_secret',
      scope: 'scope',
    }

    const result = renameObjectKeys(params, paramNames)

    expect(result).toEqual({
      consumer_key: 'salesforce-client-id',
      consumer_secret: 'salesforce-client-secret',
      scope: 'api',
    })
  })
})
