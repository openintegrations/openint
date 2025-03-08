import type {Id, Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {db, jwt} from '@/lib-server/globals'

export async function setupFixture(info: {orgId: string}) {
  const viewer: Viewer = {role: 'org', orgId: info.orgId as Id['org']}

  const api_key = 'key_123'

  await db
    .insert(schema.organization)
    .values({id: info.orgId, name: 'Test Organization', api_key})
    .onConflictDoNothing()

  await db
    .insert(schema.connector_config)
    .values({org_id: info.orgId, id: 'ccfg_greenhouse_123'})
    .onConflictDoNothing()

  await db
    .insert(schema.connection)
    .values({
      connector_config_id: 'ccfg_greenhouse_123',
      id: 'conn_greenhouse_123',
      customer_id: 'cus_123',
      settings: {apiKey: ''},
    })
    .onConflictDoNothing()
  const token = await jwt.signViewer(viewer)

  return {token, viewer}
}
