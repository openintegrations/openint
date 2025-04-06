import type {Z} from '@openint/util/zod-utils'
import type {zOAuthConfig} from './def'
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
