import type {PageProps} from '@/lib-common/next-utils'

import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {SettingsContent} from './page.client'

export default async function SettingsPage(props: PageProps) {
  const {viewer} = await currentViewer(props)
  const api = createAPICaller(viewer)
  const org = await api.getOrganization()

  return (
    <SettingsContent
      orgId={viewer.orgId ?? ''}
      apiKey={org.api_key ?? ''}
      webhookUrl={org.metadata?.webhook_url ?? ''}
    />
  )
}
