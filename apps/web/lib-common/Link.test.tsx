import {expect, test} from '@jest/globals'
import {
  env,
  getBaseURLs,
  getServerUrl,
  temporarilyModifyEnv,
} from '@openint/env'
import {resolveLinkPath} from './Link'

describe('resolveLinkPath', () => {
  test('dev environment', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: undefined,
        NEXT_PUBLIC_API_URL: undefined,
        NEXT_PUBLIC_CONSOLE_URL: undefined,
        NEXT_PUBLIC_CONNECT_URL: undefined,
      },
      () => {
        expect(env.NEXT_PUBLIC_SERVER_URL).toBeUndefined()
        expect(env.NEXT_PUBLIC_API_URL).toBeUndefined()
        expect(env.NEXT_PUBLIC_CONSOLE_URL).toBeUndefined()
        expect(env.NEXT_PUBLIC_CONNECT_URL).toBeUndefined()
        expect(getServerUrl(null)).toBe('http://localhost:3000')
        expect(getBaseURLs(null)).toEqual({
          api: 'http://localhost:3000/api',
          console: 'http://localhost:3000/console',
          connect: 'http://localhost:3000/connect',
        })
        const path = resolveLinkPath('/console')
        expect(path).toBe('/console')
      },
    )
  })

  test('production environment', () => {
    temporarilyModifyEnv(
      {
        NEXT_PUBLIC_SERVER_URL: 'https://prod.openint.dev',
        NEXT_PUBLIC_API_URL: 'https://api.openint.dev',
        NEXT_PUBLIC_CONSOLE_URL: 'https://console.openint.dev',
        NEXT_PUBLIC_CONNECT_URL: 'https://connect.openint.dev',
      },
      () => {
        expect(env.NEXT_PUBLIC_SERVER_URL).toBe('https://prod.openint.dev')
        expect(env.NEXT_PUBLIC_API_URL).toBe('https://api.openint.dev')
        expect(env.NEXT_PUBLIC_CONSOLE_URL).toBe('https://console.openint.dev')
        expect(env.NEXT_PUBLIC_CONNECT_URL).toBe('https://connect.openint.dev')
        expect(getServerUrl(null)).toBe('https://prod.openint.dev')
        expect(getBaseURLs(null)).toEqual({
          api: 'https://api.openint.dev',
          console: 'https://console.openint.dev',
          connect: 'https://connect.openint.dev',
        })
        const path = resolveLinkPath('/console')
        expect(path).toBe('/')
      },
    )
  })
})
