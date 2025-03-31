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
  oauthRedirectUrl: string
}

export function SettingsContent({
  orgId,
  apiKey,
  webhookUrl,
  oauthRedirectUrl,
}: SettingsContentProps) {
  const trpc = useTRPC()
  const setMetadataUrl = useMutation(
    trpc.setMetadataUrl.mutationOptions({
      onSuccess: () => {
        toast.success('URL saved successfully')
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`)
      },
    }),
  )

  const handleWebhookSave = (value: string) => {
    setMetadataUrl.mutate({
      urlType: 'webhook_url',
      url: value,
    })
  }

  const handleOauthRedirectSave = (value: string) => {
    setMetadataUrl.mutate({
      urlType: 'oauth_redirect_url',
      url: value,
    })
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
        onSave={handleWebhookSave}
        isSaving={setMetadataUrl.isPending}
        className="mt-4 flex items-center"
      />
      <UrlInputForm
        inputName="OAuth Redirect URL"
        defaultValue={oauthRedirectUrl}
        placeholder="https://app.example.com/oauth/callback"
        onSave={handleOauthRedirectSave}
        isSaving={setMetadataUrl.isPending}
        className="mt-4 flex items-center"
      />
    </div>
  )
}
