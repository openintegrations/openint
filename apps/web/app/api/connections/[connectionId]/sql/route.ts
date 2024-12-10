import {TRPCError} from '@trpc/server'
import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {
  contextFactory,
  DatabaseError,
  Papa,
} from '@openint/app-config/backendConfig'
import {kAcceptUrlParam} from '@openint/app-config/constants'
import type {Id} from '@openint/cdk'
import {hasRole} from '@openint/cdk'
import {makePostgresClient, zPgConfig} from '@openint/connector-postgres'
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

    if (conn.connectorName !== 'postgres') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Only postgres connections are supported',
      })
    }

    const {getPool, sql} = makePostgresClient({
      ...zPgConfig.parse(conn.settings),
      transformFieldNames: false,
    })
    const pool = await getPool()

    console.log('[sql] Will run query for user', {query, viewer})

    // TODO: Should we limit admin user to RLS also? Otherwise we might as well
    // proxy the pgMeta endpoint just like we proxy rest / graphql
    // @ts-expect-error
    const result = await pool.query(sql([query]))

    const res =
      format === 'csv'
        ? new NextResponse(
            Papa.unparse([
              ...result.rows.map((r) =>
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
        : NextResponse.json(result.rows)

    if (download) {
      // TODO: Better filename would be nice.
      res.headers.set(
        'Content-Disposition',
        `attachment; filename="openint-${Date.now()}.${format}"`,
      )
    }
    return res
  } catch (err) {
    // DatabaseError is most likely a result of invalid sql syntax
    if (err instanceof DatabaseError) {
      return new NextResponse(err.message, {status: 400})
    }
    if (err instanceof TRPCError) {
      return trpcErrorResponse(err)
    }
    throw err
  }
}
