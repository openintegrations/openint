/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-standalone-expect */
import {expect} from '@jest/globals'
import {$test} from '@openint/util/__tests__/test-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {z} from '@openint/util/zod-utils'
import {createOAuth2Client} from './OAuth2Client'
import {
  createOAuth2Server,
  type OAuthClient,
  type OAuthUser,
} from './OAuth2Server'

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
  },
  app.handle,
)

/** Code verifier must follow the specifications of RFC-7636. We
 * should add a function to generate a random code verifier that meets the spec
 * to OAuth2Client.ts */
const codeVerifier = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'

const authorizeRes = $test('authorize redirect with PKCE', async () => {
  // Use OAuth2Client to generate the authorize URL
  const authorizeUrl = await oauthClient.getAuthorizeUrl({
    redirect_uri: client.redirectUris[0],
    scope: client.scopes[0].name,
    state: 'xyz',
    code_verifier: codeVerifier,
  })

  const authorizeRequest = new Request(authorizeUrl, {redirect: 'manual'})
  const response = await app.handle(authorizeRequest)

  // Check that the response is valid
  expect(response.status).toBe(302)

  expect(response.headers.get('Location')).toBeTruthy()
  const url = new URL(response.headers.get('Location')!)
  expect(url.pathname).toBe('/callback')
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
  const res = await oauthClient.getToken({
    code: authorizeRes.current.code,
    redirectUri: client.redirectUris[0],
    code_verifier: codeVerifier,
  })

  // Validate the response
  const validatedRes = zTokenRes.parse(res)
  return validatedRes
})

$test('introspect access token', async () => {
  // For introspection, we still need to use the app directly since OAuth2Client doesn't have this method
  const introspectRequest = new Request('http://localhost/token/introspect', {
    method: 'POST',
    body: new URLSearchParams({
      token: tokenRes.current.access_token,
      client_id: client.id,
      client_secret: client.secret,
    }),
  })

  const response = await app.handle(introspectRequest)

  expect(response.status).toBe(200)

  // More fields available in https://tsoauth2server.com/docs/endpoints/introspect#response
  const res = z
    .object({
      active: z.boolean(),
      scope: z.string(),
      client_id: z.string(),
      sub: z.string(),
    })
    .parse(await response.json())

  expect(res).toMatchObject({
    active: true,
    scope: client.scopes[0].name,
    client_id: client.id,
    sub: user.id,
  })
})

const refreshTokenRes = $test('handle refresh token request', async () => {
  // Use OAuth2Client to refresh the token
  const res = await oauthClient.refreshToken(tokenRes.current.refresh_token)

  // Validate the response
  const validatedRes = zTokenRes.parse(res)

  expect(validatedRes.access_token).not.toBe(tokenRes.current.access_token)
  expect(validatedRes.refresh_token).not.toBe(tokenRes.current.refresh_token)

  return validatedRes
})

// not implemented
// $test('introspect refresh token', async () => {
//   const introspectRequest = new Request('http://localhost/token/introspect', {
//     method: 'POST',
//     body: new URLSearchParams({
//       token: refreshTokenRes.current.refresh_token,
//       client_id: client.id,
//       client_secret: client.secret,
//       token_type_hint: 'refresh_token',
//     }),
//   })

//   const response = await app.handle(introspectRequest)
//   console.log('response', await response.text())
// })

$test('previous access token is now invalid', async () => {
  // For introspection, we still need to use the app directly
  const introspectRequest = new Request('http://localhost/token/introspect', {
    method: 'POST',
    body: new URLSearchParams({
      token: tokenRes.current.access_token,
      client_id: client.id,
      client_secret: client.secret,
    }),
  })

  const response = await app.handle(introspectRequest)
  expect(response.status).toBe(200)

  const res = z.object({active: z.boolean()}).parse(await response.json())

  expect(res.active).toBe(false)
})

$test('handle revoke request', async () => {
  // Use OAuth2Client to revoke the token
  await oauthClient.revokeToken(refreshTokenRes.current.access_token)
})

$test('previous refresh token is now invalid', async () => {
  // For introspection, we still need to use the app directly
  const introspectRequest = new Request('http://localhost/token/introspect', {
    method: 'POST',
    body: new URLSearchParams({
      token: refreshTokenRes.current.refresh_token,
      client_id: client.id,
      client_secret: client.secret,
    }),
  })

  const response = await app.handle(introspectRequest)
  expect(response.status).toBe(200)

  const res = z.object({active: z.boolean()}).parse(await response.json())

  expect(res.active).toBe(false)
})
