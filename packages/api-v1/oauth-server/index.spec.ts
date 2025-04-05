import {describe, expect} from '@jest/globals'
import {$test} from '@openint/util/__tests__/test-utils'
import {createOAuth2Server} from '.'

describe('OAuth Authorization Flow', () => {
  const app = createOAuth2Server({
    clients: [
      {
        id: 'client1',
        name: 'Sample Client',
        secret: 'secret1',
        redirectUris: ['http://localhost:3000/callback'],
        allowedGrants: ['authorization_code', 'refresh_token'],
        scopes: [{name: 'read'}, {name: 'write'}],
      },
    ],
    scopes: [
      {
        name: 'read',
        description: 'Read access',
      },
      {
        name: 'write',
        description: 'Write access',
      },
    ],
    users: [{id: 'user1', username: 'testuser'}],
    serviceName: 'my-service',
  })

  const redirectUrl = $test(
    'should handle authorization request with PKCE',
    async () => {
      const authorizeRequest = new Request(
        'http://localhost/authorize?' +
          new URLSearchParams({
            response_type: 'code',
            client_id: 'client1',
            redirect_uri: 'http://localhost:3000/callback',
            scope: 'read',
            state: 'xyz',
            code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
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
      return url
    },
  )
})
