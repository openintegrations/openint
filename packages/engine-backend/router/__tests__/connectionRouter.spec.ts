import {createClerkClient} from '@clerk/backend'
import {jest} from '@jest/globals'
import {initOpenIntSDK} from '@openint/sdk'

describe('connectionRouter', () => {
  describe('listConnection', () => {
    jest.setTimeout(10000)

    it('should list connections', async () => {
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY as string,
      })

      // Create test user with required fields
      const testUser = await clerk.users.createUser({
        emailAddress: ['test@example.com'],
        firstName: 'Test',
        lastName: 'User',
        password: 'test-password-123',
      })

      console.log('testUser:', testUser)

      // Create a session token
      const signInToken = await clerk.signInTokens.createSignInToken({
        userId: testUser.id,
        expiresInSeconds: 300, // 5 minutes
      })

      console.log('signInToken:', signInToken)

      // const openint = initOpenIntSDK({
      //   baseUrl: 'http://localhost:4000/api/v0',
      //   headers: {
      //     'x-apikey': process.env.OPENINT_API_KEY ?? '',
      //     Authorization: `Bearer ${signInToken.token}`,
      //   },
      // })

      // try {
      //   const response = await openint.GET('/core/connection')
      //   console.log('response:', response)
      // } catch (err) {
      //   console.error('Error:', err)
      //   throw err
      // } finally {
      //   // Cleanup
      //   await clerk.users.deleteUser(testUser.id)
      // }
    })
  })
})
