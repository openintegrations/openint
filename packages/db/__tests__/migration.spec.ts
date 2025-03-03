import {env, envRequired} from '@openint/env'
import {initDbPg} from '../db.pg'
import {initDbPGLite} from '../db.pglite'

// Need outer describe block otherwise we get error that we try to import outside of scope of test code...
describe('for each db', () => {
  const dbs = {
    // neon driver does not work well for migration at the moment and
    // and should therefore not be used for running migrations
    // neon: initDbNeon(
    //   env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL,
    //   {role: 'system'},
    //   {logger: false},
    // ),
    pglite: initDbPGLite({logger: false}),
    pg: initDbPg(env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL, {
      logger: false,
    }),
  }

  test.each(Object.entries(dbs))('run migration %s', async (_driver, db) => {
    await db.$migrate()
    const res = await db.$exec('select * from connector_config')
    expect(res.rows).toEqual([])

    await db.$truncateAll()

  })
})
