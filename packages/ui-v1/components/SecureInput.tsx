'use client'

import type {InputProps} from '@openint/shadcn/ui'

import {Check, Copy, Eye, EyeOff} from 'lucide-react'
import {useState} from 'react'
import {Button, Input, Label, toast} from '@openint/shadcn/ui'

interface SecureInputProps extends Omit<InputProps, 'type'> {
  label?: string
  placeholder?: string
  showValue?: boolean
  readOnly?: boolean
}

export function SecureInput({
  label = 'Secure Input',
  placeholder = 'Enter secure text',
  value,
  onChange,
  showValue = false,
  readOnly = false,
  ...props
}: SecureInputProps) {
  const [showingValue, setShowValue] = useState(showValue)
  const [copied, setCopied] = useState(false)

  const toggleValueVisibility = () => {
    setShowValue(!showingValue)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value as string)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex">
        <div className="relative flex-grow">
          <Input
            {...props}
            type={showingValue ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="pr-10 font-light"
            readOnly={readOnly ?? !onChange}
            disabled={readOnly ?? !onChange}
          />
          {!showValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={toggleValueVisibility}
              aria-label={showingValue ? 'Hide value' : 'Show value'}>
              {showingValue ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="ml-2"
          onClick={copyToClipboard}
          aria-label="Copy to clipboard">
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
