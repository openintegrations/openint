import {Check, Copy, Loader2} from 'lucide-react'
import {useState} from 'react'
import {Button, Input, Label, toast} from '@openint/shadcn/ui'

interface WebhookInputProps {
  defaultValue: string
  onSave: (value: string) => void
  isSaving: boolean
}

function WebhookInput({defaultValue, onSave, isSaving}: WebhookInputProps) {
  const [webhookValue, setWebhookValue] = useState(defaultValue)
  const [lastSavedValue, setLastSavedValue] = useState(defaultValue)
  const [copied, setCopied] = useState(false)

  const hasChanges = webhookValue !== lastSavedValue
  const isValidUrl = webhookValue.startsWith('https://')
  const showError = hasChanges && !isValidUrl

  const handleCopy = async () => {
    try {
      setCopied(true)
      await navigator.clipboard.writeText(webhookValue)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleSave = async () => {
    if (!isValidUrl) {
      toast.error('Webhook URL must start with https://')
      return
    }

    try {
      await onSave(webhookValue)
      setLastSavedValue(webhookValue)
      toast.success('Webhook URL saved')
    } catch (err) {
      toast.error(
        `Error: ${err instanceof Error ? err.message : 'Failed to save webhook URL'}`,
      )
    }
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <Label className="text-md font-bold" htmlFor="webhookInput">
        Webhook URL
      </Label>
      <div className="flex flex-col gap-1">
        <div className="flex">
          <div className="relative flex-grow">
            <Input
              type="text"
              id="webhookInput"
              placeholder="https://webhook.site/webhook-url"
              value={webhookValue}
              onChange={(e) => setWebhookValue(e.target.value)}
              className={`pr-3 ${showError ? 'border-red-500' : ''}`}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="ml-2"
            onClick={handleCopy}
            aria-label="Copy to clipboard">
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="ml-2"
            onClick={handleSave}
            disabled={isSaving || !hasChanges || !isValidUrl}
            aria-label="Save webhook URL">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
        {showError && (
          <p className="text-sm text-red-500">
            Webhook URL must start with https://
          </p>
        )}
      </div>
    </div>
  )
}

export default WebhookInput
