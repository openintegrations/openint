import {inngest} from '@openint/engine-backend/events'
import {fromMaybeArray, makeUlid} from '@openint/util'

const handler = async (
  req: Request,
  {params}: {params: Promise<{webhook: string}>},
) => {
  // Workaround for lack of response from inngest.send https://discord.com/channels/842170679536517141/845000011040555018/1080057253060694036
  const traceId = makeUlid()
  const url = new URL(req.url)
  const data = {
    traceId,
    method: req.method ?? '',
    headers: Object.fromEntries(req.headers.entries()),
    path: fromMaybeArray((await params).webhook ?? '').join('/'),
    query: Object.fromEntries(url.searchParams.entries()),
    body: await req.text(),
  }

  await inngest.send({name: 'webhook/received', data})
  return Response.json({status: 'queued', traceId, data})
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
