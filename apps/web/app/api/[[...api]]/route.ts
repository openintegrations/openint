import {createApp} from '@openint/api-v1'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'

export const runtime = 'edge'

const app = createApp({
  db: initDbNeon(envRequired.DATABASE_URL),
})

const handler = app.handle

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}
