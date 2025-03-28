import {getConnectorDefaultCredentials} from './env'

describe('getConnectorDefaultCredentials', () => {
  const originalEnv = {...process.env}

  beforeEach(() => {
    // Clear any test environment variables before each test
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('ccfg_')) {
        process.env[key] = undefined
      }
    })
  })

  afterEach(() => {
    // Restore original environment after tests
    process.env = {...originalEnv}
  })

  it('should return undefined when no credentials exist for the connector', () => {
    const result = getConnectorDefaultCredentials('nonexistent')
    expect(result).toBeUndefined()
  })

  it('should extract credentials for a specific connector', () => {
    // Set up test environment variables
    process.env['ccfg_github_CLIENT_ID'] = 'github-client-id'
    process.env['ccfg_github_CLIENT_SECRET'] = 'github-client-secret'
    process.env['ccfg_slack_CLIENT_ID'] = 'slack-client-id'

    const result = getConnectorDefaultCredentials('github')

    expect(result).toEqual({
      client_id: 'github-client-id',
      client_secret: 'github-client-secret',
    })
  })

  it('should convert credential keys to lowercase', () => {
    process.env['ccfg_stripe_API_KEY'] = 'sk_test_123'
    process.env['ccfg_stripe_WEBHOOK_SECRET'] = 'whsec_456'

    const result = getConnectorDefaultCredentials('stripe')

    expect(result).toEqual({
      api_key: 'sk_test_123',
      webhook_secret: 'whsec_456',
    })
  })

  it('should handle mixed case connector names correctly', () => {
    process.env['ccfg_MixedCase_TOKEN'] = 'token123'

    const result = getConnectorDefaultCredentials('MixedCase')

    expect(result).toEqual({
      token: 'token123',
    })
  })

  it('should handle special characters in credential names', () => {
    process.env['ccfg_test_SPECIAL-NAME.WITH_CHARS'] = 'special-value'

    const result = getConnectorDefaultCredentials('test')

    expect(result).toEqual({
      'special-name.with_chars': 'special-value',
    })
  })
})
