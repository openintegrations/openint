import {makeTokenRequest, validateOAuthCredentials} from './handlers'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('OAuth2 handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('makeTokenRequest', () => {
    test('should correctly handle token exchange with custom parameters', async () => {
      // Mock successful token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          custom_field: 'custom-value',
          scope: 'read write',
        }),
      })

      // Parameters with custom fields
      const params = {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        code: 'test-code',
        redirect_uri: 'http://localhost/callback',
        grant_type: 'authorization_code',
        custom_param: 'custom-param-value',
      }

      // Call the makeTokenRequest function
      const result = await makeTokenRequest(
        'https://example.com/oauth/token',
        params,
        'exchange',
      )

      // Verify the fetch call includes all parameters
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const fetchCall = mockFetch.mock.calls[0]
      expect(fetchCall[0]).toBe('https://example.com/oauth/token')

      const fetchOptions = fetchCall[1]
      expect(fetchOptions.method).toBe('POST')
      expect(fetchOptions.headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      })

      const bodyParams = new URLSearchParams(fetchOptions.body)
      expect(bodyParams.get('client_id')).toBe('test-client-id')
      expect(bodyParams.get('client_secret')).toBe('test-client-secret')
      expect(bodyParams.get('code')).toBe('test-code')
      expect(bodyParams.get('redirect_uri')).toBe('http://localhost/callback')
      expect(bodyParams.get('grant_type')).toBe('authorization_code')
      expect(bodyParams.get('custom_param')).toBe('custom-param-value')

      // Verify the result contains the parsed tokens
      expect(result).toMatchObject({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        client_id: 'test-client-id',
        scope: 'read write',
        token_type: 'bearer',
        expires_at: expect.any(String),
        raw: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          custom_field: 'custom-value',
        },
      })
    })

    test('should handle token refresh', async () => {
      // Mock successful token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          scope: 'read write',
          expires_in: 7200,
          token_type: 'bearer',
        }),
      })

      // Parameters for refresh
      const params = {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        refresh_token: 'old-refresh-token',
        grant_type: 'refresh_token',
      }

      // Call the makeTokenRequest function
      const result = await makeTokenRequest(
        'https://example.com/oauth/token',
        params,
        'refresh',
      )

      // Verify the fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Verify the result
      expect(result).toMatchObject({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        client_id: 'test-client-id',
        token_type: 'bearer',
        expires_at: expect.any(String),
      })
    })

    test('should handle token request errors', async () => {
      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () =>
          JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid authorization code',
          }),
      })

      // Parameters
      const params = {
        client_id: 'error-client-id',
        client_secret: 'error-client-secret',
        code: 'invalid-code',
        redirect_uri: 'http://localhost/callback',
        grant_type: 'authorization_code',
      }

      // Call the makeTokenRequest function and expect it to throw
      await expect(
        makeTokenRequest('https://example.com/oauth/token', params, 'exchange'),
      ).rejects.toThrow('Token exchange failed: 400 Bad Request')
    })

    test('should handle invalid response format', async () => {
      // Mock successful response but with invalid format
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          expires_in: 3600,
          // Missing required fields like access_token
          some_other_field: 'value',
        }),
      })

      // Parameters
      const params = {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        code: 'test-code',
        redirect_uri: 'http://localhost/callback',
        grant_type: 'authorization_code',
      }

      // Call the makeTokenRequest function and expect it to throw
      await expect(
        makeTokenRequest('https://example.com/oauth/token', params, 'exchange'),
      ).rejects.toThrow('Invalid oauth2 exchange token response format')
    })
  })

  describe('validateOAuthCredentials', () => {
    test('should not throw when all required fields are present', () => {
      const config: any = {
        connector_config: {
          oauth: {
            client_id: 'test-id',
            client_secret: 'test-secret',
          },
        },
      }
      expect(() => validateOAuthCredentials(config)).not.toThrow()
    })

    test('should throw appropriate errors for missing fields', () => {
      expect(() => validateOAuthCredentials({} as any)).toThrow(
        'No connector_config provided',
      )

      expect(() =>
        validateOAuthCredentials({connector_config: {}} as any),
      ).toThrow('No client_id provided')

      expect(() =>
        validateOAuthCredentials({
          connector_config: {oauth: {client_secret: 'secret'}},
        } as any),
      ).toThrow('No client_id provided')

      expect(() =>
        validateOAuthCredentials({
          connector_config: {oauth: {client_id: 'id'}},
        } as any),
      ).toThrow('No client_secret provided')
    })

    test('should validate only specified required fields', () => {
      const config: any = {
        connector_config: {
          oauth: {client_id: 'test-id'},
        },
      }
      expect(() =>
        validateOAuthCredentials(config, ['client_id']),
      ).not.toThrow()
    })
  })
})
