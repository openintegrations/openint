import {initDbPGLite} from '../db.pglite'

test('run migration', async () => {
  const db = initDbPGLite({logger: false})
  await db.migrate()
  const res = await db.execute('select * from connector_config')

  expect(res.rows).toEqual([])
})
