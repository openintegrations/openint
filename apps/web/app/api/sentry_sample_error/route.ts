import {serverAnalytics} from '@/lib-server/analytics-server'

export async function GET() {
  serverAnalytics.track('test', {name: 'debug/debug', data: {}})
  await serverAnalytics.flush()
  throw new Error('Sentry Backend Error')
}
