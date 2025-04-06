import type {Z} from '@openint/util/zod-utils'
import {zOAuthConfig} from './def'
import {prepareScopes} from './utils'

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

describe('fillOutStringTemplateVariablesInObjectKeys', () => {
  const {fillOutStringTemplateVariablesInObjectKeys} = require('./utils')

  test('should replace variables in nested object properties', () => {
    const obj = {
      baseUrl: 'https://${connector_config.domain}/api',
      endpoints: {
        users:
          '${connector_config.baseUrl}/users/${connection_settings.user_id}',
        posts: '${connector_config.baseUrl}/posts',
        nested: {
          comments:
            '${connector_config.baseUrl}/posts/${connection_settings.post_id}/comments',
          deepNested: {
            likes:
              '${connector_config.baseUrl}/posts/${connection_settings.post_id}/likes',
          },
        },
      },
      headers: {
        Authorization: 'Bearer ${connection_settings.token}',
      },
    }

    const connectorConfig = {
      domain: 'example.com',
      baseUrl: 'https://example.com/api/v2',
    }

    const connectionSettings = {
      user_id: '12345',
      post_id: '67890',
      token: 'abc123',
    }

    const result = fillOutStringTemplateVariablesInObjectKeys(
      obj,
      connectorConfig,
      connectionSettings,
    )

    expect(result).toEqual({
      baseUrl: 'https://example.com/api',
      endpoints: {
        users: 'https://example.com/api/v2/users/12345',
        posts: 'https://example.com/api/v2/posts',
        nested: {
          comments: 'https://example.com/api/v2/posts/67890/comments',
          deepNested: {
            likes: 'https://example.com/api/v2/posts/67890/likes',
          },
        },
      },
      headers: {
        Authorization: 'Bearer abc123',
      },
    })
  })

  test('should handle null and undefined values', () => {
    const obj = {
      validUrl: '${connector_config.baseUrl}/resource',
      nullValue: null,
      undefinedValue: undefined,
      emptyObject: {},
      nestedWithNull: {
        nullProperty: null,
        validProperty: '${connector_config.version}',
      },
    }

    const connectorConfig = {
      baseUrl: 'https://api.example.com',
      version: 'v2',
    }

    const connectionSettings = {}

    const result = fillOutStringTemplateVariablesInObjectKeys(
      obj,
      connectorConfig,
      connectionSettings,
    )

    expect(result).toEqual({
      validUrl: 'https://api.example.com/resource',
      nullValue: null,
      undefinedValue: undefined,
      emptyObject: {},
      nestedWithNull: {
        nullProperty: null,
        validProperty: 'v2',
      },
    })
  })

  test('it should handle scopes array correctly', () => {
    const scopes = [
      {scope: 'read', description: 'Read access'},
      {scope: 'write', description: 'Write access'},
    ]
    const connectorConfig = {domain: 'example.com', version: 'v2'}
    const connectionSettings = {user_id: '12345'}
    const result = fillOutStringTemplateVariablesInObjectKeys(
      {scopes},
      connectorConfig,
      connectionSettings,
    )
    expect(result).toEqual({scopes})
  })

  test('should return non-object inputs unchanged', () => {
    const stringInput = 'just a string'
    const numberInput = 42
    const booleanInput = true

    const connectorConfig = {test: 'value'}
    const connectionSettings = {}

    expect(
      fillOutStringTemplateVariablesInObjectKeys(
        stringInput,
        connectorConfig,
        connectionSettings,
      ),
    ).toBe(stringInput)
    expect(
      fillOutStringTemplateVariablesInObjectKeys(
        numberInput,
        connectorConfig,
        connectionSettings,
      ),
    ).toBe(numberInput)
    expect(
      fillOutStringTemplateVariablesInObjectKeys(
        booleanInput,
        connectorConfig,
        connectionSettings,
      ),
    ).toBe(booleanInput)
    expect(
      fillOutStringTemplateVariablesInObjectKeys(
        null,
        connectorConfig,
        connectionSettings,
      ),
    ).toBe(null)
    expect(
      fillOutStringTemplateVariablesInObjectKeys(
        undefined,
        connectorConfig,
        connectionSettings,
      ),
    ).toBe(undefined)
  })
})
