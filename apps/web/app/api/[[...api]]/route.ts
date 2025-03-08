import {createApp} from '@openint/api-v1'
import {api} from '@/lib-server/globals'

const app = createApp({db})

const handler = api.handle

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}
