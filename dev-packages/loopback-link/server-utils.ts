import type {IncomingMessage, ServerResponse} from 'node:http'
import {createServer} from 'node:http'
import type Elysia from 'elysia'

/** Utility to convert Node's IncomingMessage to Web Request */
export async function nodeRequestToWebRequest(req: IncomingMessage) {
  const {method, headers, url} = req

  const body = await new Promise<Buffer>((resolve) => {
    const chunks: Uint8Array[] = []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })

  const host = headers.host || 'localhost'
  const fullUrl = `http://${host}${url}`

  return new Request(fullUrl, {
    method,
    headers: headers as Record<string, string>,
    body: ['GET', 'HEAD'].includes(method || '') ? null : body,
  })
}

/** Utility to write Web Response to Node's ServerResponse */
export async function writeWebResponseToNodeResponse(
  webResponse: Response,
  res: ServerResponse,
) {
  res.statusCode = webResponse.status
  webResponse.headers.forEach((value, key) => res.setHeader(key, value))

  const body = await webResponse.arrayBuffer()
  res.end(Buffer.from(body))
}

// Mark: -

/** Web Request handler as node HTTP server */
export function serverFromHandler(
  handler: (request: Request) => Promise<Response>,
) {
  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const webRequest = await nodeRequestToWebRequest(req)
        const webResponse = await handler(webRequest)
        await writeWebResponseToNodeResponse(webResponse, res)
      } catch (err) {
        res.statusCode = 500
        res.end('Internal Server Error')
        console.error('Error handling request:', err)
      }
    },
  )

  const stop = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()))
    })

  let resolvedPort: number | null = null

  const start = (port = 0) =>
    new Promise<{port: number; stop: typeof stop}>((resolve) =>
      server.listen(port, () => {
        resolvedPort = (server.address() as {port: number}).port
        resolve({port: resolvedPort, stop})
      }),
    )

  let startPromise: ReturnType<typeof start> | null = null

  const startIfNeeded = async (port = 0) => {
    if (startPromise) {
      return startPromise
    }
    startPromise = start(port)
    return startPromise
  }

  return {
    get port() {
      if (resolvedPort === null) {
        throw new Error('Server is not started yet')
      }
      return resolvedPort
    },
    start,
    stop,
    startIfNeeded,
    server,
  }
}

/** WinterTG compliant environments like bun */
export const serverFromElysia = (app: Elysia) => {
  const stop = app.stop

  let resolvedPort: number | null = null
  const start = (port = 0) =>
    new Promise<{port: number; stop: typeof stop}>((resolve) =>
      app.listen(port, (server) => {
        resolvedPort = server.port
        resolve({port: server.port, stop})
      }),
    )

  let startPromise: ReturnType<typeof start> | null = null
  const startIfNeeded = async (port = 0) => {
    if (startPromise) {
      return startPromise
    }
    startPromise = start(port)
    return startPromise
  }

  return {
    get port() {
      if (resolvedPort === null) {
        throw new Error('Server is not started yet')
      }
      return resolvedPort
    },
    start,
    stop,
    startIfNeeded,
  }
}
