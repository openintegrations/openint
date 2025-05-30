/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {OAuthClient, OAuthUser} from './createOAuth2Server'

import {expect} from '@jest/globals'
import {$test} from '@openint/util/__tests__/test-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {z} from '@openint/util/zod-utils'
import {createOAuth2Client} from './createOAuth2Client'
import {createOAuth2Server} from './createOAuth2Server'
import {createCodeVerifier, renameObjectKeys} from './utils.client'

const client = {
  id: 'client1',
  name: 'Sample Client',
  secret: 'secret1',
  redirectUris: ['http://localhost:4000/connect/callback'],
  allowedGrants: [
    'authorization_code',
    'refresh_token',
    'client_credentials', // needed for introspection
  ],
  scopes: [{name: 'read'}, {name: 'write'}],
} as const satisfies OAuthClient

const user = {id: 'user1', username: 'testuser'} satisfies OAuthUser

const app = createOAuth2Server({
  clients: [client],
  scopes: [
    {name: 'read', description: 'Read access'},
    {name: 'write', description: 'Write access'},
  ],
  users: [user],
  serviceName: 'my-service',
})

// Create OAuth2Client instance for testing
const oauthClient = createOAuth2Client(
  {
    clientId: client.id,
    clientSecret: client.secret,
    authorizeURL: 'http://localhost/authorize',
    tokenURL: 'http://localhost/token',
    revokeUrl: 'http://localhost/token/revoke',
    introspectUrl: 'http://localhost/token/introspect',
  },
  app.handle,
)

/** Code verifier must follow the specifications of RFC-7636. We
 * should add a function to generate a random code verifier that meets the spec
 * to OAuth2Client.ts */
const codeVerifier = createCodeVerifier()

const authorizeRes = $test('authorize redirect with PKCE', async () => {
  // Use OAuth2Client to generate the authorize URL
  const authorizeUrl = await oauthClient.getAuthorizeUrl({
    redirect_uri: client.redirectUris[0],
    scopes: [client.scopes[0].name],
    state: 'xyz',
    code_challenge: {verifier: codeVerifier, method: 'S256'},
  })

  const authorizeRequest = new Request(authorizeUrl, {redirect: 'manual'})
  const response = await app.handle(authorizeRequest)

  // Check that the response is valid
  expect(response.status).toBe(302)

  expect(response.headers.get('Location')).toBeTruthy()
  const url = new URL(response.headers.get('Location')!)
  expect(url.pathname).toBe('/connect/callback')
  expect(url.searchParams.get('code')).toBeTruthy()
  expect(url.searchParams.get('state')).toBe('xyz')

  return z
    .object({
      code: z.string(),
      state: z.string(),
    })
    .parse(urlSearchParamsToJson(url.searchParams))
})

const zTokenRes = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.literal('Bearer'),
  scope: z.literal(client.scopes[0].name),
  refresh_token: z.string(),
})

const tokenRes = $test('exchange code for tokens', async () => {
  // Use OAuth2Client to exchange code for tokens
  const res = await oauthClient.exchangeCodeForToken({
    code: authorizeRes.current.code,
    redirect_uri: client.redirectUris[0],
    code_verifier: codeVerifier,
  })

  // Validate the response
  const validatedRes = zTokenRes.parse(res)
  return validatedRes
})

$test('introspect access token', async () => {
  // Use OAuth2Client to introspect the token
  const res = await oauthClient.introspectToken({
    token: tokenRes.current.access_token,
  })

  // Validate the response
  expect(res).toMatchObject({
    active: true,
    scope: client.scopes[0].name,
    client_id: client.id,
    sub: user.id,
  })
})

const refreshTokenRes = $test('handle refresh token request', async () => {
  // Use OAuth2Client to refresh the token
  const res = await oauthClient.refreshToken({
    refresh_token: tokenRes.current.refresh_token,
  })

  // Validate the response
  const validatedRes = zTokenRes.parse(res)

  expect(validatedRes.access_token).not.toBe(tokenRes.current.access_token)
  expect(validatedRes.refresh_token).not.toBe(tokenRes.current.refresh_token)

  return validatedRes
})

// not implemented
// $test('introspect refresh token', async () => {
//   const res = await oauthClient.introspectToken({
//     token: refreshTokenRes.current.refresh_token,
//     token_type_hint: 'refresh_token',
//   })
//   console.log('response', res)
// })

$test('previous access token is now invalid', async () => {
  // Use OAuth2Client to introspect the token
  const res = await oauthClient.introspectToken({
    token: tokenRes.current.access_token,
  })

  expect(res.active).toBe(false)
})

$test('handle revoke request', async () => {
  // Use OAuth2Client to revoke the token
  await oauthClient.revokeToken({
    token: refreshTokenRes.current.access_token,
  })
})

$test('previous refresh token is now invalid', async () => {
  // Use OAuth2Client to introspect the token
  const res = await oauthClient.introspectToken({
    token: refreshTokenRes.current.refresh_token,
  })

  expect(res.active).toBe(false)
})

describe('paramKeyMapping tests', () => {
  // Test the direct utility function that performs the renaming
  test('renameObjectKeys correctly renames object keys', () => {
    const mapping = {
      redirect_uri: 'redirect',
      code_verifier: 'pkce_verifier',
      token: 'access_token',
      client_id: 'app_id',
      client_secret: 'app_secret',
      refresh_token: 'refresh',
    }

    const input = {
      redirect_uri: 'http://example.com/callback',
      code_verifier: 'test_verifier',
      client_id: 'client123',
      client_secret: 'secret123',
      token: 'token123',
      refresh_token: 'refresh123',
      unrelated_key: 'unchanged',
    }

    const result = renameObjectKeys(input, mapping)

    expect(result).toEqual({
      redirect: 'http://example.com/callback',
      pkce_verifier: 'test_verifier',
      app_id: 'client123',
      app_secret: 'secret123',
      access_token: 'token123',
      refresh: 'refresh123',
      unrelated_key: 'unchanged',
    })
  })

  // Test that getAuthorizeUrl with param mapping produces correct URL
  test('getAuthorizeUrl uses paramKeyMapping for parameters', async () => {
    const clientWithMapping = createOAuth2Client({
      clientId: 'client123',
      clientSecret: 'secret123',
      authorizeURL: 'http://example.com/authorize',
      tokenURL: 'http://example.com/token',
      paramKeyMapping: {
        redirect_uri: 'redirect',
        client_id: 'app_id',
        state: 'session_state',
        scope: 'permissions',
      },
    })

    const url = await clientWithMapping.getAuthorizeUrl({
      redirect_uri: 'http://example.com/callback',
      scopes: ['read', 'write'],
      state: 'test_state',
    })

    const parsedUrl = new URL(url)
    expect(parsedUrl.searchParams.get('redirect')).toBe(
      'http://example.com/callback',
    )
    expect(parsedUrl.searchParams.get('app_id')).toBe('client123')
    expect(parsedUrl.searchParams.get('session_state')).toBe('test_state')
    expect(parsedUrl.searchParams.get('permissions')).toBe('read write')

    // Original param names should not be present
    expect(parsedUrl.searchParams.has('redirect_uri')).toBe(false)
    expect(parsedUrl.searchParams.has('client_id')).toBe(false)
    expect(parsedUrl.searchParams.has('state')).toBe(false)
    expect(parsedUrl.searchParams.has('scope')).toBe(false)
  })
})
