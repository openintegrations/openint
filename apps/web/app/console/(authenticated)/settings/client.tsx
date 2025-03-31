'use client'

import {toast} from '@openint/ui-v1'
import SecureInput from '@openint/ui-v1/components/SecureInput'
import UrlInputForm from '@openint/ui-v1/components/UrlInputForm'
import {useMutation} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

interface SettingsContentProps {
  orgId: string
  apiKey: string
  webhookUrl: string
}

export function SettingsContent({
  orgId,
  apiKey,
  webhookUrl,
}: SettingsContentProps) {
  const trpc = useTRPC()
  const setWebhook = useMutation(
    trpc.setWebhookUrl.mutationOptions({
      onSuccess: () => {
        toast.success('Webhook URL saved')
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`)
      },
    }),
  )

  const handleSave = (value: string) => {
    setWebhook.mutate({webhookUrl: value})
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">Settings</h2>
      <SecureInput
        label="Organization Id"
        value={orgId}
        showValue={true}
        className="mt-4 flex items-center"
      />

      <SecureInput
        label="API Key"
        readOnly
        value={apiKey}
        className="mt-4 flex items-center"
      />
      <UrlInputForm
        inputName="Webhook URL"
        defaultValue={webhookUrl}
        placeholder="https://webhook.site/webhook-url"
        onSave={handleSave}
        isSaving={setWebhook.isPending}
        className="mt-4 flex items-center"
      />
      <UrlInputForm
        inputName="Oauth Redirect URL"
        defaultValue={webhookUrl}
        placeholder="https://webhook.site/webhook-url"
        onSave={handleSave}
        isSaving={setWebhook.isPending}
        className="mt-4 flex items-center"
      />
    </div>
  )
}
