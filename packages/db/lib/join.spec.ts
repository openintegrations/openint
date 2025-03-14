import {drizzle} from 'drizzle-orm/node-postgres'
import {formatSql} from '../__tests__/test-utils'
import {schema} from '../schema'

const db = drizzle('postgres://noop', {logger: false, schema})

test('query with joins', async () => {
  const query = db.query.connector_config.findMany({
    with: {
      connections: true,
    },
  })
  console.log('query', await formatSql(query?.toSQL().sql ?? ''))

  // expect(await formatSql(query?.toSQL().sql ?? '')).toMatchInlineSnapshot()
})
