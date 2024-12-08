import {upsertByIdQuery} from './makePostgresClient'

// String snapshot serializer
expect.addSnapshotSerializer({
  serialize: (val: string, _, indent) =>
    val
      .split('\n')
      .filter((s) => !!s.trim())
      .map((s) => indent + s.trim())
      .join('\n'),
  test: (val) => typeof val === 'string',
})

test('sql generation', () => {
  const tableName = 'transaction'
  const valueMap = {
    id: 'txn_test',
    provider_name: 'plaid',
    connection_id: 'conn_test123',
  }
  const query = upsertByIdQuery(tableName, valueMap)

  expect(query?.sql).toMatchInlineSnapshot(`
    INSERT INTO "transaction" ("id", "provider_name", "connection_id")
    VALUES ($1, $2, $3)
    ON CONFLICT ("id") DO UPDATE SET
    "provider_name" = excluded."provider_name",
    "connection_id" = excluded."connection_id",
    "updated_at" = now()
    WHERE
    "transaction"."provider_name" IS DISTINCT FROM excluded."provider_name" OR
    "transaction"."connection_id" IS DISTINCT FROM excluded."connection_id";
  `)
  expect(query?.values).toMatchInlineSnapshot(`
    [
        txn_test,
        plaid,
        conn_test123,
    ]
  `)
})
