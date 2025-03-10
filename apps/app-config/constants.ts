interface GetServerSidePropsContext {
  req: {headers: Record<string, string>}
}

export function getServerUrl(req: GetServerSidePropsContext['req'] | null) {
  return (
    (typeof window !== 'undefined' &&
      `${window.location.protocol}//${window.location.host}`) ||
    (req &&
      `${req.headers['x-forwarded-proto'] || 'http'}://${
        req.headers['host']
      }`) ||
    (process.env['NEXT_PUBLIC_SERVER_URL']
      ? process.env['NEXT_PUBLIC_SERVER_URL']
      : null) ||
    (process.env['VERCEL_URL']
      ? 'https://' + process.env['VERCEL_URL']
      : null) ||
    `http://localhost:${
      process.env['PORT'] || process.env['NEXT_PUBLIC_PORT'] || 3000
    }`
  )
}

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
