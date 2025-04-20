import type {PageProps} from '@/lib-common/next-utils'

import {serverDispatcher} from '@/lib-server/event.server'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {SettingsContent} from './page.client'

export default async function SettingsPage(props: PageProps) {
  const {viewer, queryClient, trpc} = await getServerComponentContext(props)

  const org = await queryClient.fetchQuery(trpc.getOrganization.queryOptions())

  async function sendDebugEvent() {
    'use server'
    console.log('Sending debug event')
    await serverDispatcher.dispatch({name: 'debug.debug', data: {}}, viewer)
    console.log('Event sent')
  }

  return (
    <SettingsContent
      orgId={viewer.orgId ?? ''}
      apiKey={org.api_key ?? ''}
      webhookUrl={org.metadata?.webhook_url ?? ''}
      sendDebugEventAction={sendDebugEvent}
    />
  )
}
