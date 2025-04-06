import {modifyRequest} from '@opensdks/fetch-links'
import {createApp} from '@openint/api-v1'
import {currentViewerFromCookie} from '@/lib-server/auth.server'
import {db} from '@/lib-server/globals'

const app = createApp({
  db,
  getAdditionalViewer: () =>
    currentViewerFromCookie().then(({viewer}) => viewer),
})

/** Elysia will assume that it is the root route, so we need to modify the url to correspond to it */
const handler = (req: Request) => {
  const url = new URL(req.url)
  url.pathname = url.pathname.replace(/^\/api/i, '')
  return app.handle(modifyRequest(req, {url: url.toString()}))
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
