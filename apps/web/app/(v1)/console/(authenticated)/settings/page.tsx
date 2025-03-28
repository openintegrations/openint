import SecureInput from '@openint/ui/components/SecureInput'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'

export default async function SettingsPage(props: PageProps) {
  const {viewer} = await currentViewer(props)
  const api = createAPICaller(viewer)
  const org = await api.getOrganization()

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">Settings</h2>
      <p className="mb-4 font-bold">
        <SecureInput
          label="Organization Id"
          value={viewer.orgId ?? ''}
          showValue={true}
        />
      </p>

      <div className="mt-4 flex items-center">
        <SecureInput label="API Key" readOnly value={org.api_key ?? ''} />
      </div>
    </div>
  )
}
