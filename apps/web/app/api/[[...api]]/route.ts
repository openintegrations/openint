import {app} from '@openint/api-v1'

const handler = app.handle

export {
  handler as HEAD,
  handler as OPTIONS,
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
}
