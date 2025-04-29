import {sql} from 'drizzle-orm'
import {describeEachDatabase} from '../__tests__/test-utils'
import {schema} from '../schema'

describeEachDatabase({migrate: true, drivers: ['pglite']}, (db) => {
  beforeAll(async () => {
    await db.insert(schema.connector_config).values({
      id: 'ccfg_apollo_333',
      org_id: 'org_222',
      config: {},
    })
    await db.insert(schema.connector_config).values({
      id: 'ccfg_greenhouse_222',
      org_id: 'org_222',
      config: {},
    })
    await db.insert(schema.connection).values({
      id: 'conn_greenhouse_222',
      connector_config_id: 'ccfg_greenhouse_222',
      display_name: 'Test Connection',
      env_name: 'sandbox',
      customer_id: 'cus_123',
    })
    await db.insert(schema.connection).values({
      id: 'conn_greenhouse_223',
      connector_config_id: 'ccfg_greenhouse_222',
      display_name: 'Test Connection',
      env_name: 'sandbox',
      customer_id: 'cus_223',
    })
    await db.insert(schema.connection).values({
      id: 'conn_greenhouse_323',
      connector_config_id: 'ccfg_greenhouse_222',
      display_name: 'Test Connection',
      env_name: 'sandbox',
      customer_id: 'cus_323',
    })
  })

  test('group by with count', async () => {
    const query = db
      .select({
        id: schema.connection.customer_id,
        connection_count: sql<number>`cast(count(*) AS integer)`,
        created_at: sql<string>`min(${schema.connection.created_at})`,
        updated_at: sql<string>`max(${schema.connection.updated_at})`,
        total: sql<number>`count(*) OVER ()`.as('total'),
      })
      .from(schema.connection)
      .groupBy(schema.connection.customer_id)
      .orderBy(schema.connection.customer_id)

    // drizzle queries are modified in place and not immutable... so gotta be careful
    // console.log(query.toSQL().sql)
    // console.log(query.limit(2).toSQL().sql)
    // console.log(query.offset(1).toSQL().sql)
    expect(await query.limit(1)).toMatchObject([{id: 'cus_123', total: 3}])
    expect(await query.offset(1).limit(2)).toMatchObject([
      {id: 'cus_223', total: 3},
      {id: 'cus_323', total: 3},
    ])
  })
})
