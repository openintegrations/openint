import {describe, expect, test} from '@jest/globals'
import {getBaseURLs} from '@openint/env'
import {getAbsoluteApiV1URL} from './typed-routes'

describe('getApiV1URL', () => {
  test('returns correct URL for webhook routes', () => {
    const webhookUrl = getAbsoluteApiV1URL('/webhook/plaid')
    const baseURL = getBaseURLs(null).api
    expect(webhookUrl).toBe(`${baseURL}/v1/webhook/plaid`)
  })
})
