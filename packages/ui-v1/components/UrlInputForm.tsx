'use client'

import {Check, Copy, Loader2} from 'lucide-react'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Button, Input, Label, toast} from '@openint/shadcn/ui'

interface UrlInputFormProps extends React.HTMLAttributes<HTMLDivElement> {
  inputName: string
  placeholder?: string
  defaultValue: string
  onSave: (value: string) => void
  isSaving: boolean
}

function UrlInputForm({
  inputName,
  placeholder = 'https://',
  defaultValue,
  onSave,
  isSaving,
  className,
  ...props
}: UrlInputFormProps) {
  const [urlValue, setUrlValue] = React.useState(defaultValue)
  const [lastSavedValue, setLastSavedValue] = React.useState(defaultValue)
  const [copied, setCopied] = React.useState(false)

  const hasChanges = urlValue !== lastSavedValue
  const isValidUrl = urlValue.startsWith('https://')
  const showError = hasChanges && !isValidUrl

  const handleCopy = async () => {
    try {
      setCopied(true)
      await navigator.clipboard.writeText(urlValue)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleSave = async () => {
    if (!isValidUrl) {
      toast.error(`${inputName} must start with https://`)
      return
    }

    try {
      await onSave(urlValue)
      setLastSavedValue(urlValue)
      toast.success(`${inputName} saved`)
    } catch (err) {
      toast.error(
        `Error: ${err instanceof Error ? err.message : `Failed to save ${inputName}`}`,
      )
    }
  }

  const inputId = `${inputName.toLowerCase().replace(/\s+/g, '-')}-input`

  return (
    <div className={cn('w-full max-w-sm space-y-2', className)} {...props}>
      <Label className="text-md font-bold" htmlFor={inputId}>
        {inputName}
      </Label>
      <div className="flex flex-col gap-1">
        <div className="flex">
          <div className="relative flex-grow">
            <Input
              type="text"
              id={inputId}
              placeholder={placeholder}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className={`pr-3 font-light ${showError ? 'border-red-500' : ''}`}
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
            aria-label={`Save ${inputName}`}>
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
            {inputName} must start with https://
          </p>
        )}
      </div>
    </div>
  )
}

export default UrlInputForm
