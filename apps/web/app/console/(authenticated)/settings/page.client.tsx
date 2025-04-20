'use client'

import {toast} from '@openint/shadcn/ui/sonner'
import {SecureInput} from '@openint/ui-v1/components/SecureInput'
import {WebhookInput} from '@openint/ui-v1/components/WebhookInput'
import {useMutation, useTRPC} from '@/lib-client/TRPCApp'

interface SettingsContentProps {
  orgId: string
  apiKey: string
  webhookUrl: string
  sendDebugEventAction: () => unknown
}

export function SettingsContent({
  orgId,
  apiKey,
  webhookUrl,
  sendDebugEventAction,
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
    <div className="max-w-3xl p-6">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">Settings</h2>
      <div className="mb-4 font-bold">
        <SecureInput label="Organization Id" value={orgId} showValue={true} />
      </div>

      <div className="mt-4">
        <SecureInput label="API Key" readOnly value={apiKey} />
      </div>
      <div className="mt-4">
        <WebhookInput
          defaultValue={webhookUrl}
          onSave={handleSave}
          isSaving={setWebhook.isPending}
          sendDebugEvent={sendDebugEventAction}
        />
      </div>
    </div>
  )
}
