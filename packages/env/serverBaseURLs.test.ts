/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {describe, expect, test} from '@jest/globals'
import {temporarilyModifyEnv} from './env'
import {
  getConnectorDefaultCredentials,
  getServerUrl,
  resolveRoute,
} from './serverBaseURLs'

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

describe('getServerUrl', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    // Reset window object
    globalThis.window = originalWindow
  })

  afterEach(() => {
    // Restore original window
    globalThis.window = originalWindow
  })

  test('should use window.location in browser environment', () => {
    // Mock window object
    globalThis.window = {
      location: {protocol: 'https:', host: 'example.com'},
    } as any

    const result = getServerUrl(null)
    expect(result).toBe('https://example.com')
  })

  test('should use request headers when provided', () => {
    const headers = new Headers({
      'x-forwarded-proto': 'https',
      host: 'api.example.com',
    })
    const req = new Request('https://example.com', {headers})
    const ctx = {req}

    const result = getServerUrl(ctx)
    expect(result).toBe('https://api.example.com')
  })

  test('should use http as default protocol when x-forwarded-proto is not provided', () => {
    const headers = new Headers({
      host: 'api.example.com',
    })
    const req = new Request('https://example.com', {headers})
    const ctx = {req}

    const result = getServerUrl(ctx)
    expect(result).toBe('http://api.example.com')
  })

  test('should use NEXT_PUBLIC_SERVER_URL when available', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://custom-server.com',
      },
      () => {
        const result = getServerUrl(null)
        expect(result).toBe('https://custom-server.com')
      },
    )
  })

  test('should use VERCEL_URL when available', () => {
    temporarilyModifyEnv(
      {
        VERCEL_URL: 'my-app.vercel.app',
      },
      () => {
        const result = getServerUrl(null)
        expect(result).toBe('https://my-app.vercel.app')
      },
    )
  })

  test('should fall back to localhost with PORT when no other options are available', () => {
    temporarilyModifyEnv(
      {
        PORT: '8080',
      },
      () => {
        const result = getServerUrl(null)
        expect(result).toBe('http://localhost:8080')
      },
    )
  })

  test('should fall back to localhost with NEXT_PUBLIC_PORT when PORT is not available', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_PORT: '4000',
      },
      () => {
        const result = getServerUrl(null)
        expect(result).toBe('http://localhost:4000')
      },
    )
  })

  test('should fall back to localhost:3000 when no port is specified', () => {
    const result = getServerUrl(null)
    expect(result).toBe('http://localhost:3000')
  })

  test('should prioritize window.location over request headers', () => {
    // Mock window object
    globalThis.window = {
      location: {protocol: 'https:', host: 'example.com'},
    } as any

    const headers = new Headers({
      'x-forwarded-proto': 'http',
      host: 'api.example.com',
    })
    const req = new Request('https://example.com', {headers})
    const ctx = {req}

    const result = getServerUrl(ctx)
    expect(result).toBe('https://example.com')
  })

  test('should prioritize request headers over environment variables', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://custom-server.com',
      },
      () => {
        const headers = new Headers({
          'x-forwarded-proto': 'https',
          host: 'api.example.com',
        })
        const req = new Request('https://example.com', {headers})
        const ctx = {req}

        const result = getServerUrl(ctx)
        expect(result).toBe('https://api.example.com')
      },
    )
  })
})

describe('resolveRoute', () => {
  test('should resolve absolute URL for api base', () => {
    const result = resolveRoute({
      base: 'api',
      route: '/v1/users',
      type: 'absolute',
      opts: null,
    })
    expect(result).toBe('http://localhost:3000/api/v1/users')
  })

  test('should resolve relative URL for api base', () => {
    const result = resolveRoute({
      base: 'api',
      route: '/v1/users',
      type: 'relative',
      opts: null,
    })
    expect(result).toBe('/api/v1/users')
  })

  test('should resolve absolute URL for console base', () => {
    const result = resolveRoute({
      base: 'console',
      route: '/settings',
      type: 'absolute',
      opts: null,
    })
    expect(result).toBe('http://localhost:3000/console/settings')
  })

  test('should resolve relative URL for console base', () => {
    const result = resolveRoute({
      base: 'console',
      route: '/settings',
      type: 'relative',
      opts: null,
    })
    expect(result).toBe('/console/settings')
  })

  test('should resolve absolute URL for connect base', () => {
    const result = resolveRoute({
      base: 'connect',
      route: '/callback',
      type: 'absolute',
      opts: null,
    })
    expect(result).toBe('http://localhost:3000/connect/callback')
  })

  test('should resolve relative URL for connect base', () => {
    const result = resolveRoute({
      base: 'connect',
      route: '/callback',
      type: 'relative',
      opts: null,
    })
    expect(result).toBe('/connect/callback')
  })

  test('should handle custom server URL from environment', () => {
    temporarilyModifyEnv(
      {NEXT_PUBLIC_SERVER_URL: 'https://custom.example.com'},
      () => {
        const result = resolveRoute({
          base: 'api',
          route: '/v1/users',
          type: 'absolute',
          opts: null,
        })
        expect(result).toBe('https://custom.example.com/api/v1/users')
      },
    )
  })

  test('should handle request-based server URL', () => {
    const mockRequest = new Request('https://request.example.com/api', {
      headers: {
        host: 'request.example.com',
        'x-forwarded-proto': 'https',
      },
    })

    const result = resolveRoute({
      base: 'api',
      route: '/v1/users',
      type: 'absolute',
      opts: {req: mockRequest},
    })
    expect(result).toBe('https://request.example.com/api/v1/users')
  })
})
