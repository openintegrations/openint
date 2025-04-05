/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-standalone-expect */
import crypto from 'node:crypto'
import {expect} from '@jest/globals'
import {$test} from '@openint/util/__tests__/test-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {z} from '@openint/util/zod-utils'
import {createOAuth2Server, type OAuthClient, type OAuthUser} from '.'

const client = {
  id: 'client1',
  name: 'Sample Client',
  secret: 'secret1',
  redirectUris: ['http://localhost:3000/callback'],
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

const codeVerifier = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
const codeChallenge = Buffer.from(
  crypto.createHash('sha256').update(codeVerifier).digest(),
).toString('base64url')

const authorizeRes = $test('authorize redirect with PKCE', async () => {
  const authorizeRequest = new Request(
    'http://localhost/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: client.id,
        redirect_uri: client.redirectUris[0],
        scope: client.scopes[0].name,
        state: 'xyz',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      }).toString(),
    {redirect: 'manual'},
  )

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
  const tokenRequest = new Request('http://localhost/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: client.id,
      client_secret: client.secret,
      grant_type: 'authorization_code',
      code: authorizeRes.current.code,
      redirect_uri: client.redirectUris[0],
      code_verifier: codeVerifier,
    }),
  })

  const response = await app.handle(tokenRequest)
  expect(response.status).toBe(200)

  const res = zTokenRes.parse(await response.json())

  return res
})

$test('introspect access token', async () => {
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
  const refreshTokenRequest = new Request('http://localhost/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenRes.current.refresh_token,
      client_id: client.id,
      client_secret: client.secret,
    }),
  })

  const response = await app.handle(refreshTokenRequest)
  expect(response.status).toBe(200)

  const res = zTokenRes.parse(await response.json())

  expect(res.access_token).not.toBe(tokenRes.current.access_token)
  expect(res.refresh_token).not.toBe(tokenRes.current.refresh_token)

  return res
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
  const revokeRequest = new Request('http://localhost/token/revoke', {
    method: 'POST',
    body: new URLSearchParams({
      token: refreshTokenRes.current.access_token,
      client_id: client.id,
      client_secret: client.secret,
    }),
  })

  const response = await app.handle(revokeRequest)
  expect(response.status).toBe(200)
})

$test('previous refresh token is now invalid', async () => {
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
