import {parseArgs} from 'node:util'
import {makeId, makeJwtClient, type Id, type Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {makeUlid} from '@openint/util'

type Info = Required<typeof values>

export async function setupFixture(info: Info) {
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

  await (async function setupGreenhouse() {
    const ccfgId = makeId('ccfg', 'greenhouse', makeUlid())
    const connId = makeId('conn', 'greenhouse', makeUlid())

    await db
      .insert(schema.connector_config)
      .values({org_id: info.orgId, id: ccfgId})
      .onConflictDoNothing()

    await db
      .insert(schema.connection)
      .values({
        connector_config_id: ccfgId,
        id: connId,
        customer_id: info.cusId,
        settings: {apiKey: ''},
      })
      .onConflictDoNothing()
  })()

  await (async function setupPlaid() {
    const ccfgId = makeId('ccfg', 'plaid', makeUlid())
    const connId = makeId('conn', 'plaid', makeUlid())

    await db
      .insert(schema.connector_config)
      .values({
        org_id: info.orgId,
        id: ccfgId,
        config: {
          envName: 'sandbox',
          credentials: null,
          clientName: 'This Application',
          products: ['transactions'],
          countryCodes: ['US', 'CA'],
          language: 'en',
        },
      })
      .onConflictDoNothing()

    await db
      .insert(schema.connection)
      .values({
        connector_config_id: ccfgId,
        id: connId,
        customer_id: info.cusId,
        settings: {
          itemId: '',
          accessToken: '',
          institution: null,
          item: null,
          status: null,
          webhookItemError: null,
        },
      })
      .onConflictDoNothing()
  })()

  const token = await jwt.signViewer(viewer)

  return {...info, token, viewer}
}

const {values} = parseArgs({
  options: {
    orgId: {type: 'string', short: 'o'},
    cusId: {type: 'string', short: 'c'},
  },
})
const {orgId = `org_${makeUlid()}`, cusId = `cus_${makeUlid()}`} = values

// @ts-expect-error esmodule all right
const res = await setupFixture({orgId, cusId})
console.log(res)
