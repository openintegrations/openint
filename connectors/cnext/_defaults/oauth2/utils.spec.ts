import {z} from 'zod'
import {zOAuthConfig} from './def'
import {prepareScopes} from './utils'

test('Scope separator should work correctly for different delimiters', () => {
  let mockOauthConfig = {
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
  } satisfies z.infer<typeof zOAuthConfig>

  const scopesWithDefaultSpaceSeparator = mockOauthConfig.scopes
    .map((s) => s.scope)
    .join(' ')
  expect(prepareScopes(mockOauthConfig)).toBe(
    encodeURIComponent(scopesWithDefaultSpaceSeparator),
  )

  const scopesWithCommaSeparator = mockOauthConfig.scopes
    .map((s) => s.scope)
    .join(',')
  expect(prepareScopes({...mockOauthConfig, scope_separator: ','})).toBe(
    encodeURIComponent(scopesWithCommaSeparator),
  )
})

describe('fillOutStringTemplateVariables', () => {
  const {fillOutStringTemplateVariables} = require('./utils')

  test('should replace connector config variables in URL', () => {
    const url = 'https://api.example.com/${connector_config.version}/resource'
    const connectorConfig = {version: 'v2'}
    const connectionSettings = {}

    const result = fillOutStringTemplateVariables(
      url,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBe('https://api.example.com/v2/resource')
  })

  test('should replace connection settings variables in URL', () => {
    const url = 'https://api.example.com/users/${connection_settings.user_id}'
    const connectorConfig = {}
    const connectionSettings = {user_id: '12345'}

    const result = fillOutStringTemplateVariables(
      url,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBe('https://api.example.com/users/12345')
  })

  test('should replace multiple variables in URL', () => {
    const url =
      'https://${connector_config.domain}/api/${connector_config.version}/users/${connection_settings.user_id}'
    const connectorConfig = {domain: 'example.com', version: 'v2'}
    const connectionSettings = {user_id: '12345'}

    const result = fillOutStringTemplateVariables(
      url,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBe('https://example.com/api/v2/users/12345')
  })

  test('should return original URL when no variables present', () => {
    const url = 'https://api.example.com/resource'
    const connectorConfig = {version: 'v2'}
    const connectionSettings = {user_id: '12345'}

    const result = fillOutStringTemplateVariables(
      url,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBe('https://api.example.com/resource')
  })

  test('should not replace variables when values are missing', () => {
    const url =
      'https://${connector_config.domain}/api/${connector_config.missing}'
    const connectorConfig = {domain: 'example.com'}
    const connectionSettings = {}

    const result = fillOutStringTemplateVariables(
      url,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBe('https://example.com/api/${connector_config.missing}')
  })

  test('should handle undefined inputs gracefully', () => {
    const url = 'https://api.example.com/${connector_config.version}'
    const connectorConfig = undefined
    const connectionSettings = {}

    expect(() =>
      fillOutStringTemplateVariables(url, connectorConfig, connectionSettings),
    ).not.toThrow()
  })
})
