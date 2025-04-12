import {joinPath, trimTrailingSlash} from '@openint/util/url-utils'
import {env} from './env'

export function getConnectorDefaultCredentials(
  connectorName: string,
): Record<string, string> | undefined {
  const credentials: Record<string, string> = {}
  for (const key in process.env) {
    if (key.startsWith(`ccfg_${connectorName}_`)) {
      const credentialKey = key
        .replace(`ccfg_${connectorName}_`, '')
        .toLowerCase()
      credentials[credentialKey] = process.env[key] as string
    }
  }
  return Object.keys(credentials).length > 0 ? credentials : undefined
}

export interface GetServerUrlOptions {
  /**
   * The request object to use to get the server URL.
   * If not provided, the server URL will be determined from the current environment.
   */
  req?: Request
}

export function getServerUrl(opts: GetServerUrlOptions | null | undefined) {
  return trimTrailingSlash(
    (typeof window !== 'undefined' &&
      `${window.location.protocol}//${window.location.host}`) ||
      (opts?.req &&
        `${opts.req.headers.get('x-forwarded-proto') || 'http'}://${opts.req.headers.get(
          'host',
        )}`) ||
      (env.NEXT_PUBLIC_SERVER_URL ? env.NEXT_PUBLIC_SERVER_URL : null) ||
      (env.VERCEL_URL ? 'https://' + env.VERCEL_URL : null) ||
      `http://localhost:${env.PORT || env.NEXT_PUBLIC_PORT || 3000}`,
  )
}

export function getBaseURLs(opts: GetServerUrlOptions | null | undefined) {
  const serverUrl = getServerUrl(opts)
  // TODO: Add support for custom domains for each of these services
  return {
    api:
      trimTrailingSlash(env.NEXT_PUBLIC_API_URL) ?? joinPath(serverUrl, 'api'),
    console:
      trimTrailingSlash(env.NEXT_PUBLIC_CONSOLE_URL) ??
      joinPath(serverUrl, 'console'),
    connect:
      trimTrailingSlash(env.NEXT_PUBLIC_CONNECT_URL) ??
      joinPath(serverUrl, 'connect'),
  }
}

export function resolveRoute({
  base,
  route,
  type,
  opts,
}: {
  base: keyof ReturnType<typeof getBaseURLs>
  route: string
  type: 'absolute' | 'relative'
  opts: GetServerUrlOptions | null | undefined
}) {
  const baseURLs = getBaseURLs(opts)
  const urlStr = joinPath(baseURLs[base], route)
  if (type === 'absolute') {
    return urlStr
  }
  const url = new URL(urlStr)
  return url.pathname
}
