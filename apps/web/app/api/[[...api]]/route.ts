import {createApp} from '@openint/api-v1'
import {db} from '@/lib-server/globals'

const app = createApp({db})
const handler = (req: Request) => {
  if (req.url.includes('/v1') && !req.url.includes('/api/v1')) {
    const cleanUrl = req.url.replace('/v1', '/api/v1')
    return app.handle(new Request(cleanUrl, req))
  }
  return app.handle(req)
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
}
