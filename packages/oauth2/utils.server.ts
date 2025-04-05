import type {RequestInterface} from '@jmondi/oauth2-server'

/**
 * Converts a vanilla Request object to the format expected by the OAuth2 server
 * The default implementation in @jmondi/oauth2-server/vanilla does not work with x-www-form-urlencoded
 */
export async function requestFromVanilla(
  req: Request,
): Promise<RequestInterface> {
  const url = new URL(req.url)
  const query: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = value
  })

  let body: Record<string, any> = {}
  const contentType = req.headers.get('content-type')

  if (contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await req.text()
    const params = new URLSearchParams(formData)
    body = Object.fromEntries(params.entries())
  } else if (req.body instanceof ReadableStream) {
    try {
      body = await req.json()
    } catch {
      body = {}
    }
  } else if (req.body != null) {
    try {
      body = JSON.parse(req.body)
    } catch {
      body = {}
    }
  }

  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    if (key === 'cookie') return
    headers[key] = value
  })

  return {
    query,
    body,
    headers,
  } satisfies RequestInterface
}

export {responseToVanilla} from '@jmondi/oauth2-server/vanilla'
