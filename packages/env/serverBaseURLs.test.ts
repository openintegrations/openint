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
  test('return absolute URLs unchanged', () => {
    const [result, baseURL] = resolveRoute('https://example.com/path', null)
    expect(result).toBe('https://example.com/path')
    expect(baseURL).toBeUndefined()
    expect(new URL(result, baseURL).toString()).toBe(result)
  })

  test('no custom domains', () => {
    temporarilyModifyEnv(
      {NEXT_PUBLIC_SERVER_URL: 'https://example.com'},
      () => {
        const [result, baseURL] = resolveRoute('/api/test', null)
        expect(result).toBe('/api/test')
        expect(baseURL).toBe('https://example.com')
        expect(new URL(result, baseURL).toString()).toBe(
          'https://example.com/api/test',
        )
      },
    )
  })

  test('with custom domains', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://example.com',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
        NEXT_PUBLIC_CONSOLE_URL: 'https://console.example.com',
        NEXT_PUBLIC_CONNECT_URL: 'https://connect.example.com',
      },
      () => {
        const [apiResult, apiBaseURL] = resolveRoute('/api/test', null)
        expect(apiResult).toBe('/test')
        expect(apiBaseURL).toBe('https://api.example.com')
        expect(new URL(apiResult, apiBaseURL).toString()).toBe(
          'https://api.example.com/test',
        )

        const [consoleResult, consoleBaseURL] = resolveRoute(
          '/console/dashboard',
          null,
        )
        expect(consoleResult).toBe('/dashboard')
        expect(consoleBaseURL).toBe('https://console.example.com')
        expect(new URL(consoleResult, consoleBaseURL).toString()).toBe(
          'https://console.example.com/dashboard',
        )

        const [connectResult, connectBaseURL] = resolveRoute(
          '/connect/oauth',
          null,
        )
        expect(connectResult).toBe('/oauth')
        expect(connectBaseURL).toBe('https://connect.example.com')
        expect(new URL(connectResult, connectBaseURL).toString()).toBe(
          'https://connect.example.com/oauth',
        )
      },
    )
  })

  test('preserve routes that do not match base paths', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://example.com',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      },
      () => {
        const [result, baseURL] = resolveRoute('/other/path', null)
        expect(result).toBe('/other/path')
        expect(baseURL).toBe('https://example.com')
        expect(new URL(result, baseURL).toString()).toBe(
          'https://example.com/other/path',
        )
      },
    )
  })

  test('preserve url params', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://example.com',
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      },
      () => {
        const [result, baseURL] = resolveRoute(
          '/api/test?foo=bar&baz=qux',
          null,
        )
        expect(result).toBe('/test?foo=bar&baz=qux')
        expect(baseURL).toBe('https://api.example.com')
        expect(new URL(result, baseURL).toString()).toBe(
          'https://api.example.com/test?foo=bar&baz=qux',
        )

        const [withHash, withHashBaseURL] = resolveRoute(
          '/api/test?foo=bar#hash',
          null,
        )
        expect(withHash).toBe('/test?foo=bar#hash')
        expect(withHashBaseURL).toBe('https://api.example.com')
        expect(new URL(withHash, withHashBaseURL).toString()).toBe(
          'https://api.example.com/test?foo=bar#hash',
        )
      },
    )
  })
})
