import type {RemoteCallback} from 'drizzle-orm/pg-proxy'
import postgres from 'postgres'
import {z} from 'zod'
import {env} from '@openint/env'
import {createFetchWithLinks, loopbackLink} from '@openint/loopback-link'

/** Debugging proxy */
export function createDbQueryHandler(dbUrl: string) {
  const pg = postgres(dbUrl)
  return async function handleQuery(req: Request) {
    const {sql, params, method} = await req.json().then((r) =>
      z
        .object({
          sql: z.string(),
          params: z.array(z.any()),
          method: z.string(),
        })
        .parse(r),
    )
    console.log(
      '[pgProxyServer] sql:',
      sql,
      'params:',
      params,
      'method:',
      method,
    )
    try {
      const rows = await pg.unsafe(sql, params)
      return new Response(JSON.stringify({rows}), {
        headers: {'Content-Type': 'application/json'},
      })
    } catch (err) {
      console.error('Error postgres server:', err)
      return new Response(JSON.stringify({rows: [], error: `${err}`}), {
        headers: {'Content-Type': 'application/json'},
      })
    }
  }
}

export function createDbProxyRemoteCallback(opts: {
  url: string
  dbFetch: typeof fetch
}): RemoteCallback {
  const {url, dbFetch} = opts
  return async (sql, params, method) => {
    console.log(
      '[pgProxyClient]',
      'sql',
      sql,
      'params',
      params,
      'method',
      method,
    )
    try {
      const res = await dbFetch(
        new Request(url, {
          body: JSON.stringify({sql, params, method}),
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
        }),
      )
        .then((r) => r.json())
        .then((r) => r as {rows: []; error?: string})
      if (res.error) {
        throw new Error(res.error)
      }
      return res
    } catch (err) {
      console.error('Error from pg proxy server:', err)
      throw err
    }
  }
}

export function createDbDebuggingProxy(dbUrl = env.DATABASE_URL) {
  const remoteCallback = createDbProxyRemoteCallback({
    url: 'http://localhost',
    dbFetch: createFetchWithLinks({
      links: [loopbackLink({}), createDbQueryHandler(dbUrl)],
    }),
  })
  return {remoteCallback}
}
