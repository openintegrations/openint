import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/node-postgres'
import {describeEachDatabase, formatSql} from '../__tests__/test-utils'
import {schema} from '../schema'

const db = drizzle('postgres://noop', {logger: false, schema})

test('query with to-many joins', async () => {
  const query = db.query.connector_config.findMany({
    with: {connections: true},
  })
  // console.log(await formatSql(query?.toSQL().sql ?? ''))

  expect(await formatSql(query?.toSQL().sql ?? '')).toMatchInlineSnapshot(`
    "select
      "connector_config"."id",
      "connector_config"."connector_name",
      "connector_config"."config",
      "connector_config"."created_at",
      "connector_config"."updated_at",
      "connector_config"."org_id",
      "connector_config"."display_name",
      "connector_config"."env_name",
      "connector_config"."disabled",
      "connector_config"."default_pipe_out",
      "connector_config"."default_pipe_in",
      "connector_config"."default_pipe_out_destination_id",
      "connector_config"."default_pipe_in_source_id",
      "connector_config"."metadata",
      "connector_config_connections"."data" as "connections"
    from
      "connector_config"
      left join lateral (
        select
          coalesce(
            json_agg(
              json_build_array(
                "connector_config_connections"."id",
                "connector_config_connections"."connector_name",
                "connector_config_connections"."customer_id",
                "connector_config_connections"."connector_config_id",
                "connector_config_connections"."integration_id",
                "connector_config_connections"."env_name",
                "connector_config_connections"."settings",
                "connector_config_connections"."created_at",
                "connector_config_connections"."updated_at",
                "connector_config_connections"."display_name",
                "connector_config_connections"."disabled",
                "connector_config_connections"."metadata"
              )
            ),
            '[]'::json
          ) as "data"
        from
          "connection" "connector_config_connections"
        where
          "connector_config_connections"."connector_config_id" = "connector_config"."id"
      ) "connector_config_connections" on true
    "
  `)
})

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
    })
  })

  test('simple count', async () => {
    const query = db
      .select({connection_count: sql`count(*)`})
      .from(schema.connection)
      .where(sql`
        ${schema.connection}.connector_config_id = ${'ccfg_greenhouse_222'}
      `)
    expect(await formatSql(query?.toSQL().sql ?? '')).toMatchInlineSnapshot(`
      "select
        count(*)
      from
        "connection"
      where
        "connection".connector_config_id = $1
      "
    `)
    expect(await query).toMatchObject([{connection_count: 1}])
  })

  test('query with count and join', async () => {
    const query = db.query.connector_config.findMany({
      columns: {id: true},
      with: {
        connections: {
          columns: {id: true},
          limit: 5,
        },
      },
      extras: {
        connection_count: sql<number>`
          (
            SELECT
              COUNT(*)
            FROM
              ${schema.connection}
            WHERE
              ${schema.connection}.connector_config_id = ${schema
            .connector_config.id}
          )
        `.as('connection_count'),
      },
    })

    expect(await formatSql(query?.toSQL().sql ?? '')).toMatchInlineSnapshot(`
      "select
        "connector_config"."id",
        (
          SELECT
            COUNT(*)
          FROM
            "connection"
          WHERE
            "connection".connector_config_id = "connector_config"."id"
        ) as "connection_count",
        "connector_config_connections"."data" as "connections"
      from
        "connector_config"
        left join lateral (
          select
            coalesce(
              json_agg(
                json_build_array("connector_config_connections"."id")
              ),
              '[]'::json
            ) as "data"
          from
            (
              select
                *
              from
                "connection" "connector_config_connections"
              where
                "connector_config_connections"."connector_config_id" = "connector_config"."id"
              limit
                $1
            ) "connector_config_connections"
        ) "connector_config_connections" on true
      "
    `)
    const res = await query

    expect(res).toMatchObject([
      {id: 'ccfg_apollo_333', connection_count: 0, connections: []},
      {
        id: 'ccfg_greenhouse_222',
        connection_count: 1,
        connections: [expect.anything()],
      },
    ])
  })
})
