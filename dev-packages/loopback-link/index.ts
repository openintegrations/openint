// TODO: Move me into opensdks
import type {Link as FetchLink} from '@opensdks/fetch-links'

import {applyLinks, modifyRequest} from '@opensdks/fetch-links'
import {serverFromHandler} from './server-utils'

interface LoopbackOptions {
  /** defaults to 0 which is a random port */
  port?: number
}

// Figure out how to re-use server between requests while still being able to clean up
export const loopbackLink =
  (opts?: LoopbackOptions): FetchLink =>
  async (req, next) => {
    const server = serverFromHandler(next)
    await server.startIfNeeded(opts?.port)
    const res = await fetch(
      modifyRequest(req, {
        url: {hostname: 'localhost', port: server.port.toString()},
      }),
    )
    await server.stop()
    return res
  }

export {createFetchWithLinks} from '@opensdks/fetch-links'

export const withLoopback = (handler: (req: Request) => Promise<Response>) => {
  return (req: Request) => applyLinks(req, [loopbackLink(), handler])
}
