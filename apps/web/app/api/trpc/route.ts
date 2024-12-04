import {renderTrpcPanel} from 'trpc-panel'
import {appRouter} from '@openint/api'

export const maxDuration = 60

export function GET(req: Request) {
  // req.url is normally `/api/trpc` already which is the right place
  return new Response(renderTrpcPanel(appRouter, {url: req.url ?? ''}), {
    headers: {'Content-Type': 'text/html'},
  })
}
