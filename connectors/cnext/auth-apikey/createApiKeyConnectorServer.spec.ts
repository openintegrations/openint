import type {BaseContext} from '@openint/cdk'

import {describe, expect, jest, test} from '@jest/globals'
import {createAPIKeyConnectorServer} from './createApiKeyConnectorServer'
import {apiKeySchemas} from './schemas'

const mockFetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  } as Response),
)
global.fetch = mockFetch as unknown as typeof fetch

describe('createAPIKeyConnectorServer', () => {
  const connectorDef = {
    name: 'acme-apikey' as const,
    metadata: {
      authType: 'API_KEY',
      jsonDef: {
        auth: {
          type: 'API_KEY',
          base_url: 'https://example.com',
          verification: {
            endpoint: '/verify',
            method: 'GET',
            api_key_location: 'header_basic_password',
          },
        },
      },
    },
    schemas: {
      ...apiKeySchemas,
      name: {_type: 'literal', value: 'acme-apikey' as const},
    },
  }

  // Create the server implementation and assert its type
  const server = createAPIKeyConnectorServer(connectorDef as any) as {
    checkConnection: (opts: {
      settings: {api_key: string}
      config: Record<string, unknown>
      instance: Record<string, unknown>
      options: Record<string, unknown>
      context: BaseContext
    }) => Promise<{
      status: 'healthy' | 'disconnected'
      status_message: string | null
      settings: {api_key: string}
    }>
  }

  // Mock context with required properties
  const mockContext: BaseContext = {
    webhookBaseUrl: 'https://webhook.example.com',
    baseURLs: {
      api: 'https://api.example.com',
      console: 'https://console.example.com',
      connect: 'https://connect.example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('checkConnection succeeds with valid API key', async () => {
    const mockSettings = {
      api_key: 'mock-apikey',
    }

    const config = {}
    const instance = {}
    const options = {}

    const result = await server.checkConnection({
      settings: mockSettings,
      config,
      instance,
      options,
      context: mockContext,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/verify',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: 'Basic bW9jay1hcGlrZXk6',
        },
      }),
    )

    expect(result).toEqual({
      status: 'healthy',
      status_message: null,
      settings: mockSettings,
    })
  })

  test('checkConnection fails with invalid API key', async () => {
    const mockSettings = {
      api_key: 'invalid-key',
    }

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({message: 'Invalid Basic Auth credentials'}),
        text: () =>
          Promise.resolve('{"message":"Invalid Basic Auth credentials"}'),
      } as Response),
    )

    const config = {}
    const instance = {}
    const options = {}

    const result = await server.checkConnection({
      settings: mockSettings,
      config,
      instance,
      options,
      context: mockContext,
    })

    expect(result).toEqual({
      status: 'disconnected',
      status_message:
        'Connection check failed with status 401 (Unauthorized): {"message":"Invalid Basic Auth credentials"}',
      settings: mockSettings,
    })
  })

  test('checkConnection throws error when API key is missing', async () => {
    const mockSettings = {
      api_key: '', // Empty string instead of undefined
    }

    const config = {}
    const instance = {}
    const options = {}

    await expect(
      server.checkConnection({
        settings: mockSettings,
        config,
        instance,
        options,
        context: mockContext,
      }),
    ).rejects.toThrow('Credentials are not configured')
  })

  test('checkConnection handles network errors', async () => {
    const mockSettings = {
      api_key: 'mock-apikey',
    }

    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error')),
    )

    const config = {}
    const instance = {}
    const options = {}

    const result = await server.checkConnection({
      settings: mockSettings,
      config,
      instance,
      options,
      context: mockContext,
    })

    expect(result).toEqual({
      status: 'disconnected',
      status_message: 'Network error',
      settings: mockSettings,
    })
  })
})
