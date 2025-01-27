import {TRPCError} from '@trpc/server'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {contextFactory, Papa} from '@openint/app-config/backendConfig'
import {__DEBUG__, kAcceptUrlParam} from '@openint/app-config/constants'
import type {Id} from '@openint/cdk'
import {hasRole} from '@openint/cdk'
import {zPgConfig} from '@openint/connector-postgres'
import {drizzle} from '@openint/db'
import {R, z} from '@openint/util'
import {serverComponentGetViewer} from '@/lib-server/server-component-helpers'
import {trpcErrorResponse} from '@/lib-server/server-helpers'

// TODO: Document searchParams and share it with client (as least the typing if nothing else)

export async function GET(
  request: NextRequest,
  {params: {connectionId}}: {params: {connectionId: string}},
) {
  try {
    const {
      q: query,
      [kAcceptUrlParam]: acceptedFormat,
      dl: download,
    } = Object.fromEntries(request.nextUrl.searchParams.entries())

    if (!query) {
      return new NextResponse('sql query param q is required', {status: 400})
    }
    const format = z.enum(['csv', 'json']).default('json').parse(acceptedFormat)

    const viewer = await serverComponentGetViewer(request.nextUrl)
    if (!hasRole(viewer, ['user', 'org', 'system'])) {
      throw new TRPCError({
        code: viewer.role === 'anon' ? 'UNAUTHORIZED' : 'FORBIDDEN',
      })
    }

    const {services} = contextFactory.fromViewer(viewer)
    const conn = await services.getConnectionOrFail(connectionId as Id['conn'])

    if (conn.connector_name !== 'postgres') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Only postgres connections are supported',
      })
    }
    const pgConfig = zPgConfig.parse(conn.settings)

    const db = drizzle(pgConfig.databaseUrl, {logger: __DEBUG__})

    console.log('[sql] Will run query for user', {query, viewer})

    // TODO: Should we limit admin user to RLS also? Otherwise we might as well
    // proxy the pgMeta endpoint just like we proxy rest / graphql

    const rows = await db.execute(query)
    const res =
      format === 'csv'
        ? new NextResponse(
            Papa.unparse([
              ...rows.map((r) =>
                R.mapValues(r, (v) =>
                  v instanceof Date
                    ? v.toISOString()
                    : typeof v === 'object'
                      ? JSON.stringify(v)
                      : v,
                ),
              ),
            ]),
            {
              // headers: {'Content-Type': 'text/csv'},
            },
          )
        : NextResponse.json(rows)

    if (download) {
      // TODO: Better filename would be nice.
      res.headers.set(
        'Content-Disposition',
        `attachment; filename="openint-${Date.now()}.${format}"`,
      )
    }
    return res
  } catch (err) {
    // TODO: Fix me to use postgres.js error instead.
    // DatabaseError is most likely a result of invalid sql syntax
    // if (err instanceof DatabaseError) {
    //   return new NextResponse(err.message, {status: 400})
    // }
    if (err instanceof TRPCError) {
      return trpcErrorResponse(err)
    }
    throw err
  }
}
