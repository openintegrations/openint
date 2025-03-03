import {env, envRequired} from '@openint/env'
import {initDbPg} from '../db.pg'
import {initDbPGLite} from '../db.pglite'

const dbs = {
  // neon driver does not work well for migration at the moment and
  // and should therefore not be used for running migrations
  // neon: initDbNeon(
  //   env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL,
  //   {role: 'system'},
  //   {logger: false},
  // ),
  pglite: () => initDbPGLite({logger: false}),
  pg: () =>
    initDbPg(env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL, {
      logger: false,
    }),
}

// Need outer describe block otherwise we get error that we try to import outside of scope of test code...
describe.each(Object.entries(dbs))('db: %s', (_driver, makeDb) => {
  const db = makeDb()

  test('run migration', async () => {
    await db.$migrate()
    const res = await db.$exec('select * from connector_config')
    expect(res.rows).toEqual([])
  })

  afterAll(async () => {
    await db.$truncateAll()
  })
})
