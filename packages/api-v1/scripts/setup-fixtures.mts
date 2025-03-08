import {makeJwtClient, type Id, type Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'

export async function setupFixture(info: {orgId: string}) {
  const db = initDbNeon(envRequired.DATABASE_URL)
  const jwt = makeJwtClient({
    secretOrPublicKey: envRequired.JWT_SECRET,
  })

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

const res = await setupFixture({orgId: 'org_123'})
console.log(res)
