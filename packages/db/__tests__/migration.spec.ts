import {initDbPGLite} from '../db.pglite'

test('run migration', async () => {
  const db = initDbPGLite({logger: true})
  await db.migrate()
  const res = await db.execute('select * from connector_config')
  expect(res).toEqual([])
})
