import {NextResponse} from 'next/server'
import {inngest} from '@openint/engine-backend/events'
import {makeUlid} from '@openint/util'

const handler = async (
  req: Request,
  extra: {params: Promise<{webhook?: string[]}>},
) => {
  // Workaround for lack of response from inngest.send https://discord.com/channels/842170679536517141/845000011040555018/1080057253060694036
  const traceId = makeUlid()
  const url = new URL(req.url)
  const params = await extra.params
  const data = {
    traceId,
    pathParams: params,
    method: req.method ?? '',
    headers: Object.fromEntries(req.headers.entries()),
    path: (params.webhook ?? []).join('/'),
    query: Object.fromEntries(url.searchParams.entries()),
    body: await req.text(),
  }

  const res = await inngest
    .send({name: 'webhook.received', data})
    .catch((err) => err as Error)
  const resData = res instanceof Error ? {error: res.message} : res.ids
  const status = res instanceof Error ? 500 : 200

  return NextResponse.json(
    {
      ...resData,
      status,
      traceId,
      ...(req.headers.get('x-test') === 'true' && {payload: data}),
    },
    {status},
  )
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
