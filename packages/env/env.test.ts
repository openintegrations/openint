import {describe, expect, test} from '@jest/globals'
import {envMutable, temporarilyModifyEnv} from './env'

describe('temporarilyModifyEnv', () => {
  test('should temporarily modify env values and restore them after function execution', () => {
    // Store original values
    const originalValues = {
      DATABASE_URL: envMutable.DATABASE_URL,
      DEBUG: envMutable.DEBUG,
    }

    // Define test override values
    const overrideValues = {
      DATABASE_URL: 'test-db-url',
      DEBUG: 'true',
    }

    // Execute function with override
    temporarilyModifyEnv(overrideValues, () => {
      // Verify values are modified during execution
      expect(envMutable.DATABASE_URL).toBe(overrideValues.DATABASE_URL)
      expect(envMutable.DEBUG).toBe(overrideValues.DEBUG)
    })

    // Verify values are restored after execution
    expect(envMutable.DATABASE_URL).toBe(originalValues.DATABASE_URL)
    expect(envMutable.DEBUG).toBe(originalValues.DEBUG)
  })

  test('should handle nested function execution', () => {
    const originalValue = envMutable.DATABASE_URL
    const firstOverride = 'first-override'
    const secondOverride = 'second-override'

    temporarilyModifyEnv({DATABASE_URL: firstOverride}, () => {
      expect(envMutable.DATABASE_URL).toBe(firstOverride)

      temporarilyModifyEnv({DATABASE_URL: secondOverride}, () => {
        expect(envMutable.DATABASE_URL).toBe(secondOverride)
      })

      // Should be back to first override after nested function
      expect(envMutable.DATABASE_URL).toBe(firstOverride)
    })

    // Should be back to original after all
    expect(envMutable.DATABASE_URL).toBe(originalValue)
  })

  test('should handle empty override object', () => {
    const originalValues = {
      DATABASE_URL: envMutable.DATABASE_URL,
      DEBUG: envMutable.DEBUG,
    }

    temporarilyModifyEnv({}, () => {
      expect(envMutable.DATABASE_URL).toBe(originalValues.DATABASE_URL)
      expect(envMutable.DEBUG).toBe(originalValues.DEBUG)
    })

    expect(envMutable.DATABASE_URL).toBe(originalValues.DATABASE_URL)
    expect(envMutable.DEBUG).toBe(originalValues.DEBUG)
  })

  test('should handle undefined values in override', () => {
    const originalValues = {
      DATABASE_URL: envMutable.DATABASE_URL,
      DEBUG: envMutable.DEBUG,
    }

    const overrideValues = {
      DATABASE_URL: undefined,
      DEBUG: undefined,
    }

    temporarilyModifyEnv(overrideValues, () => {
      expect(envMutable.DATABASE_URL).toBe(undefined)
      expect(envMutable.DEBUG).toBe(undefined)
    })

    // Should restore original values after execution
    expect(envMutable.DATABASE_URL).toBe(originalValues.DATABASE_URL)
    expect(envMutable.DEBUG).toBe(originalValues.DEBUG)
  })
})
