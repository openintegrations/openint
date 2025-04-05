/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable jest/no-standalone-expect */
import crypto from 'node:crypto'
import {describe, expect} from '@jest/globals'
import {base64urlencode} from '@jmondi/oauth2-server'
import {$test} from '@openint/util/__tests__/test-utils'
import {urlSearchParamsToJson} from '@openint/util/url-utils'
import {z} from '@openint/util/zod-utils'
import {createOAuth2Server, type OAuthClient, type OAuthUser} from '.'

describe('OAuth Authorization Flow', () => {
  const client = {
    id: 'client1',
    name: 'Sample Client',
    secret: 'secret1',
    redirectUris: ['http://localhost:3000/callback'],
    allowedGrants: ['authorization_code', 'refresh_token'],
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

  const codeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
  const codeVerifier = base64urlencode(
    crypto.createHash('sha256').update(codeChallenge).digest(),
  )

  const authorizeRes = $test(
    'should handle authorization request with PKCE',
    async () => {
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
    },
  )

  $test('should handle token request', async () => {
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
    console.log('response', await response.text())
    // expect(response.status).toBe(200)
    // expect(response.json()).resolves.toEqual({
    //   access_token: expect.any(String),
    //   token_type: 'Bearer',
    // })
  })
})
