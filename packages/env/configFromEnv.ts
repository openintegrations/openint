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
  return (
    (typeof window !== 'undefined' &&
      `${window.location.protocol}//${window.location.host}`) ||
    (opts?.req &&
      `${opts.req.headers.get('x-forwarded-proto') || 'http'}://${opts.req.headers.get(
        'host',
      )}`) ||
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

export function getBaseURLs(opts: GetServerUrlOptions | null | undefined) {
  let serverUrl = getServerUrl(opts)
  if (serverUrl.endsWith('/')) {
    serverUrl = serverUrl.slice(0, -1)
  }
  // TODO: Add support for custom domains for each of these services
  return {
    api: `${serverUrl}/api`,
    console: `${serverUrl}/console`,
    connect: `${serverUrl}/connect`,
  }
}
