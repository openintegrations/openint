import type {Viewer} from '@openint/cdk'
import type {Database} from '@openint/db'
import type {CreateFetchHandlerOptions} from '../handlers'

import {createTRPCClient, httpLink} from '@trpc/client'
import {schema} from '@openint/db'
import {envRequired} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {createApp} from '../app'
import {createFetchHandlerTRPC} from '../handlers'
import {makeJwtClient} from '../lib/makeJwtClient'
import {type AppRouter} from '../routers'

export async function headersForViewer(viewer: Viewer) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer.role === 'anon'
    ? {}
    : {authorization: `Bearer ${await jwt.signToken(viewer)}`}
}

/** Prefer to operate at the highest level of stack possible while still bienbeing performant */
export function getTestTRPCClient(
  {router, ...opts}: Omit<CreateFetchHandlerOptions, 'endpoint'>,
  viewerOrKey: Viewer | {api_key: string},
) {
  const handler = router
    ? createFetchHandlerTRPC({...opts, router, endpoint: '/v1/trpc'})
    : createApp(opts).handle

  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost/v1/trpc',
        fetch: (input, init) => handler(new Request(input, init)),
        headers:
          'api_key' in viewerOrKey
            ? {authorization: `Bearer ${viewerOrKey.api_key}`}
            : () => headersForViewer(viewerOrKey),
      }),
    ],
  })
}

export async function createTestOrganization(db: Database) {
  const orgId = `org_${makeUlid()}`
  const apiKey = `key_${makeUlid()}`

  const org = await db
    .insert(schema.organization)
    .values({
      id: orgId,
      name: 'Test Organization',
      slug: 'test-org',
      api_key: apiKey,
      metadata: {
        test: true,
      },
    })
    .returning()

  return org[0]!
}
