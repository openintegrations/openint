import {serverAnalytics} from '@/lib-server/analytics-server'

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  serverAnalytics.track('test', {name: 'debug/debug', data: {}})
  await serverAnalytics.flush()
  throw new Error('Sentry Backend Error')
}
