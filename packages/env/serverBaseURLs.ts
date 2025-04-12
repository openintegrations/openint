import {R} from '@openint/util/remeda'
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

const bases = ['api', 'console', 'connect'] as const

export function getBaseURLs(opts: GetServerUrlOptions | null | undefined) {
  const serverUrl = getServerUrl(opts)
  // TODO: Add support for custom domains for each of these services
  return R.mapToObj(bases, (base) => [
    base,
    trimTrailingSlash(
      // cannot use stringUtils due to Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime
      // in lodash...
      env[`NEXT_PUBLIC_${base.toUpperCase() as Uppercase<typeof base>}_URL`],
    ) ?? joinPath(serverUrl, base),
  ])
}

/**
 * Resolve relative route strings
 * Can pass resulting route and baseURL to new URL(route, baseURL) to get the absolute URL
 */
export function resolveRoute(
  route: string,
  opts: GetServerUrlOptions | null | undefined,
): [path: string, baseURL: string | undefined] {
  // Absolute urls, return as is
  if (!route.startsWith('/')) {
    return [route, undefined]
  }
  for (const [base, baseURL] of Object.entries(getBaseURLs(opts))) {
    if (route.startsWith(`/${base}`)) {
      return baseURL.endsWith(`/${base}`)
        ? [route, baseURL.replace(`/${base}`, '')]
        : [
            route === `/${base}`
              ? '/' // prevent empty string which means "current url" rather than root url
              : route.replace(`/${base}`, ''),
            baseURL,
          ]
    }
  }
  return [route, getServerUrl(opts)]
}
