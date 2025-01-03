import {createClerkClient} from '@clerk/backend'
import {initOpenIntSDK} from '@openint/sdk'

describe('connectionRouter', () => {
  describe('listConnection', () => {
    it('should list connections', async () => {
      // We need clerk session for the token request, when we do a simple call it has a header from clerk that the call is not made on the browser and we get 401
      // Having issues with clerk key not being recognized.
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY as string,
      })

      // Create test user
      const testUser = await clerk.users.createUser({
        emailAddress: ['test@example.com'],
        password: 'test-password123',
      })

      // Create sign in token
      const signInToken = await clerk.signInTokens.createSignInToken({
        userId: testUser.id,
        expiresInSeconds: 300, // 5 minutes
      })

      // Use openint sdk.
      const openint = initOpenIntSDK({
        baseUrl: 'http://localhost:4000/api/v0',
        headers: {
          'x-apikey': process.env.OPENINT_API_KEY ?? '',
          Authorization: `Bearer ${signInToken.token}`,
        },
      })

      try {
        // Get connections, we need to add a expect for the response data.
        const response = await openint.GET('/core/connection')
        console.log('response:', response)
      } catch (err) {
        console.error('Error:', err)
      }

      // Delete user after test?
      await clerk.users.deleteUser(testUser.id)
    })
  })
})
