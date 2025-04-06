export function getServerUrl(ctx: {req: Request} | null | undefined) {
  return (
    (typeof window !== 'undefined' &&
      `${window.location.protocol}//${window.location.host}`) ||
    (ctx?.req &&
      `${ctx.req.headers.get('x-forwarded-proto') || 'http'}://${ctx.req.headers.get(
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
