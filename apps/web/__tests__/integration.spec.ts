import {mergeHeaders} from '@opensdks/fetch-links'
import type {NextResponse} from 'next/server'
import type {GET} from '@/app/api/webhook/[[...webhook]]/route'

type ResponseType<T> = T extends NextResponse<infer U> ? U : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseFromHandler<T extends (...args: any) => any> = ResponseType<
  Awaited<ReturnType<T>>
>

const port = Number.parseInt(process.env['PORT'] || '4000', 10)

function endpoint(path: `/${string}`) {
  return `http://localhost:${port}${path}`
}

async function fetchJson<T>(path: `/${string}`, init?: RequestInit) {
  const res = await fetch(endpoint(path), {
    ...init,
    headers: mergeHeaders({'x-test': 'true'}, init?.headers),
  })
  return [(await res.json()) as T, res] as const
}

test('/debug', async () => {
  const [json, res] = await fetchJson('/api/debug')
  expect(res.status).toBe(200)
  expect(json).toEqual({ok: true})
})

test.each([
  ['', {webhook: undefined}],
  ['/', {webhook: undefined}],
  ['/plaid', {webhook: ['plaid']}],
  ['/plaid/item_123', {webhook: ['plaid', 'item_123']}],
])('/webhook%s', async (path, params) => {
  type WebhookResponse = ResponseFromHandler<typeof GET>

  const [json] = await fetchJson<WebhookResponse>(`/api/webhook${path}`)
  expect(json.payload?.pathParams).toEqual(params)
})