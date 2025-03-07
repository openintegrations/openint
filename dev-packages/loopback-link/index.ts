// TODO: Move me into opensdks
import {node} from '@elysiajs/node'
import type {Link as FetchLink} from '@opensdks/fetch-links'
import {modifyRequest} from '@opensdks/fetch-links'
import {Elysia} from 'elysia'

/** 0 means random, but not supported by node adapter */
export const listenWithPort = (app: Elysia, port = 0) =>
  new Promise<number>((resolve) => {
    app.listen(port, (server) => {
      resolve(server.port)
    })
  })

export const getRandomPort = (min = 10000, max = 65535) =>
  Math.floor(Math.random() * (max - min + 1)) + min

interface ServeOptions {
  /** defaults to 0 which is a random port */
  port?: number
}

export function serveAsync(
  handler: (request: Request) => Promise<Response>,
  opts: ServeOptions = {},
) {
  console.log('[loopbackLink] Serving', opts)
  return new Promise<{port: number; close: () => Promise<void>}>((resolve) => {
    const app = new Elysia({adapter: node()}).all('*', ({request}) =>
      handler(request),
    )
    // 0 means random also, but not supported by node.js
    app.listen(opts.port || getRandomPort(), (server) => {
      resolve({
        port: server.port,
        close: () => {},
      })
    })
  })
}

// TODO: Add option for re-using the server between requests
export const loopbackLink =
  (opts?: ServeOptions): FetchLink =>
  async (req, next) => {
    const server = await serveAsync(next, opts)
    const res = await fetch(
      modifyRequest(req, {
        url: {hostname: 'localhost', port: server.port.toString()},
      }),
    )
    await server.close()
    return res
  }

// void serveAsync(async () => new Response('👋')).then((info) => {
//   console.log(`Server running at ${info.address}:${info.port}`)
// })

export {createFetchWithLinks} from '@opensdks/fetch-links'

// serveAsync(async () => new Response('👋')).then((info) => {
//   console.log(`Server running at ${info.port}`)
// })
