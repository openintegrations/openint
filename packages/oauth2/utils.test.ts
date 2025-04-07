import {renameObjectKeys} from './utils.client'

describe('renameObjectKeys', () => {
  test('should map parameters according to keyMapping', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      scope: 'read',
    }

    const keyMapping = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
      scope: 'scopes',
    }

    const result = renameObjectKeys(params, keyMapping)

    expect(result).toEqual({
      clientKey: 'test-client-id',
      clientSecret: 'test-client-secret',
      scopes: 'read',
    })
  })

  test('should handle empty params', () => {
    const params = {}
    const keyMapping = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
    }

    const result = renameObjectKeys(params, keyMapping)

    expect(result).toEqual({})
  })

  test('should handle empty keyMapping', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
    }
    const keyMapping = {}

    const result = renameObjectKeys(params, keyMapping)

    // With empty keyMapping, we expect the original params to be returned unchanged
    expect(result).toEqual({
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
    })
  })

  test('should keep parameters that are not in keyMapping', () => {
    const params = {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      redirect_uri: 'https://example.com/callback',
      state: 'random-state',
    }

    const keyMapping = {
      client_id: 'clientKey',
      client_secret: 'clientSecret',
    }

    const result = renameObjectKeys(params, keyMapping)

    // Parameters with mappings should be renamed, others should remain unchanged
    expect(result).toEqual({
      clientKey: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirect_uri: 'https://example.com/callback',
      state: 'random-state',
    })
  })

  test('should handle Salesforce-like parameter mapping', () => {
    const params = {
      client_id: 'salesforce-client-id',
      client_secret: 'salesforce-client-secret',
      scope: 'api',
    }

    const keyMapping = {
      client_id: 'consumer_key',
      client_secret: 'consumer_secret',
      scope: 'scope',
    }

    const result = renameObjectKeys(params, keyMapping)

    expect(result).toEqual({
      consumer_key: 'salesforce-client-id',
      consumer_secret: 'salesforce-client-secret',
      scope: 'api',
    })
  })
})
