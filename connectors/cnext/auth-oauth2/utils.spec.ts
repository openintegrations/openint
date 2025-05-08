import {describe, expect, test} from '@jest/globals'
import {getRequestedScopes} from './utils'

describe('getRequestedScopes', () => {
  test('should return the requested scopes', () => {
    const scopes = getRequestedScopes(
      {oauth: {scopes: ['scope1', 'scope2']}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        scope_separator: ' ',
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2'])
  })

  test('should include required_scopes from oauthConfig', () => {
    const scopes = getRequestedScopes(
      {oauth: {scopes: ['scope1', 'scope2']}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        required_scopes: ['scope3', 'scope4'],
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2', 'scope3', 'scope4'])
  })

  test('should deduplicate scopes that appear in both config and required_scopes', () => {
    const scopes = getRequestedScopes(
      {oauth: {scopes: ['scope1', 'scope2', 'scope3']}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        required_scopes: ['scope2', 'scope3', 'scope4'],
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2', 'scope3', 'scope4'])
  })

  test('should handle config with no scopes', () => {
    const scopes = getRequestedScopes(
      {oauth: {}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        required_scopes: ['scope1', 'scope2'],
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2'])
  })

  test('should handle config with no oauth property', () => {
    const scopes = getRequestedScopes(
      {},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        required_scopes: ['scope1', 'scope2'],
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2'])
  })

  test('empty array required scopes shoudl not add separator at the end of the string', () => {
    const scopes = getRequestedScopes(
      {},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        required_scopes: [''],
      },
    )
    expect(scopes).toEqual([''])
  })

  test('should handle scopes as a string with default separator', () => {
    const scopes = getRequestedScopes(
      // @ts-expect-error - Testing legacy case where scopes is a string
      {oauth: {scopes: 'scope1 scope2'}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2'])
  })

  test('should handle scopes as a string with custom separator', () => {
    const scopes = getRequestedScopes(
      // @ts-expect-error - Testing legacy case where scopes is a string
      {oauth: {scopes: 'scope1,scope2,scope3'}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        scope_separator: ',',
      },
    )
    expect(scopes).toEqual(['scope1', 'scope2', 'scope3'])
  })

  test('should work with no required_scopes and no config scopes', () => {
    const scopes = getRequestedScopes(
      {oauth: {}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
      },
    )
    expect(scopes).toEqual([])
  })

  test('should handle both required_scopes and config.oauth.scopes being undefined', () => {
    const scopes = getRequestedScopes(
      {oauth: {scopes: undefined}},
      {
        type: 'OAUTH2',
        scopes: [],
        authorization_request_url: 'https://example.com/auth',
        token_request_url: 'https://example.com/token',
        params_config: {},
        // No required_scopes specified
      },
    )
    expect(scopes).toEqual([])
  })
})
