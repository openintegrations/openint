import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../client'
import {SettingsContent} from './client'

export default async function SettingsPage(props: PageProps) {
  const {viewer, token = ''} = await currentViewer(props)
  const api = createAPICaller(viewer)
  const org = await api.getOrganization()

  return (
    <ClientApp token={token}>
      <SettingsContent
        orgId={viewer.orgId ?? ''}
        apiKey={org.api_key ?? ''}
        webhookUrl={org.metadata?.webhook_url ?? ''}
      />
    </ClientApp>
  )
}
