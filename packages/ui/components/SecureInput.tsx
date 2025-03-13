'use client'

import {Check, Copy, Eye, EyeOff} from 'lucide-react'
import {useState} from 'react'
import {
  useToast,
  Button,
  Input,
  Label,
  type InputProps
} from '@openint/shadcn/ui'

interface SecureInputProps extends Omit<InputProps, 'type'> {
  label?: string
  placeholder?: string
}

export default function SecureInput({
  label = 'Secure Input',
  placeholder = 'Enter secure text',
  value,
  onChange,
  ...props
}: SecureInputProps) {
  const [showValue, setShowValue] = useState(false)
  const [copied, setCopied] = useState(false)
  const {toast} = useToast()

  const toggleValueVisibility = () => {
    if (showValue) {
      setShowValue(false)
      toast.info('Value hidden')
    } else {
      setShowValue(true)
      toast.info('Value visible')
    }
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
    <div className="w-full max-w-sm space-y-2">
      <Label className="text-md font-bold" htmlFor="secureInput">
        {label}
      </Label>
      <div className="flex">
        <div className="relative flex-grow">
          <Input
            {...props}
            type={showValue ? 'text' : 'password'}
            id="secureInput"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={toggleValueVisibility}
            aria-label={showValue ? 'Hide value' : 'Show value'}>
            {showValue ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
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
