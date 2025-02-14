import {kApikeyHeader, kApikeyUrlParam} from '@openint/app-config/constants'
import SecureInput from '@openint/ui/components/SecureInput'
import {getOrCreateApikey} from '@/lib-server'
import {serverComponentGetViewer} from '@/lib-server/server-component-helpers'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const viewer = await serverComponentGetViewer()
  const apikey = await getOrCreateApikey(viewer)

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">Settings</h2>
      <p className="mb-4 font-bold">
        Organization ID: <span className="font-normal">{viewer.orgId}</span>
      </p>

      <div className="mt-4 flex items-center">
        <SecureInput label="API Key" readOnly value={apikey} />
      </div>
      <SettingsForm />
    </div>
  )
}
