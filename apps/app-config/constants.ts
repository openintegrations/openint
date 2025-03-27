import {getServerUrl} from '@openint/env'

export const kApikeyUrlParam = 'apikey' as const
/** TODO: Dedupe me from AuthProvider.kApiKeyMetadata */
export const kApikeyMetadata = 'apikey' as const

export const kApikeyHeader = 'x-apikey' as const

export const kAcceptUrlParam = '_accept' as const

export const kAccessToken = '_token' as const

export const __DEBUG__ =
  process.env['DEBUG'] === 'false'
    ? false
    : getServerUrl(null).includes('localhost') ||
      Boolean(
        typeof window !== 'undefined' &&
          window.localStorage.getItem('__DEBUG__'),
      ) ||
      !!process.env['DEBUG']

export const isProd = getServerUrl(null).includes('app.openint.dev')

export const isMainPreview = getServerUrl(null).includes(
  'openint-git-main-openint-dev.vercel.app',
)
