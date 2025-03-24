import {injectDefaultCredentials} from './defaultCredentialsInjection'

function getMockConnectorDefaultCredentials(
  connectorName: string,
): Record<string, string> {
  if (connectorName === 'test-oauth2-connector') {
    return {
      client_id: 'default-client-id',
      client_secret: 'default-client-secret',
    }
  } else if (connectorName === 'test-api-key-connector') {
    return {
      api_key: 'default-api-key',
    }
  }
  return {}
}

describe('injectDefaultCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Silence console warnings
    console.warn = jest.fn()
  })

  it('should inject default credentials for OAUTH2 connectors', () => {
    // Arrange
    const connector = {
      name: 'test-oauth2-connector',
      metadata: {
        authType: 'OAUTH2',
      },
    }
    const input = {
      config: {
        someConfig: 'value',
        oauth: {
          existingOauthConfig: 'exists',
        },
      },
    }

    // Act
    const result = injectDefaultCredentials(
      connector as any,
      input,
      getMockConnectorDefaultCredentials(connector.name),
    )

    // Assert
    expect(result.config).toEqual({
      ...input.config,
      oauth: {
        ...input.config.oauth,
        client_id: 'default-client-id',
        client_secret: 'default-client-secret',
      },
    })
  })

  it('should throw TRPCError when OAUTH2 config validation fails', () => {
    // Arrange
    const connector = {
      name: 'test-oauth2-connector',
      metadata: {
        authType: 'OAUTH2',
      },
    }
    const input = {
      config: {
        someConfig: 'value',
        // Missing oauth object will cause validation to fail
      },
    }

    // Act & Assert
    let error
    try {
      injectDefaultCredentials(connector as any, input)
    } catch (e) {
      error = e
    }

    expect(error).toBeDefined()
  })

  it('should inject default credentials for non-OAuth connectors', () => {
    const connector = {
      name: 'test-api-key-connector',
      metadata: {},
    }
    const input = {
      config: {
        someConfig: 'value',
      },
    }

    // Act
    const result = injectDefaultCredentials(
      connector as any,
      input,
      getMockConnectorDefaultCredentials(connector.name),
    )

    // Assert
    expect(result.config).toEqual({
      ...input.config,
      api_key: 'default-api-key',
    })
  })
})
