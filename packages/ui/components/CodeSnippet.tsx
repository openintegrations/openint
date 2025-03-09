import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export interface CodeSnippetProps {
  /**
   * The code or text to display in the snippet
   */
  code: string
  /**
   * Optional CSS class name
   */
  className?: string
  /**
   * Optional placeholder text to show when code is empty
   */
  placeholder?: string
  /**
   * Optional max width for the snippet
   */
  maxWidth?: string
}

// Helper function to combine class names
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

export function CodeSnippet({
  code,
  className = '',
  placeholder = 'sf_ykhiar',
  maxWidth = '100%',
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code || placeholder)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(err => {
          console.error('Failed to copy text: ', err)
        })
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = code || placeholder
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Fallback: Failed to copy text: ', err)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div
      className={`group flex items-center justify-between rounded-md bg-gray-100 p-2 transition-all hover:bg-gray-200 cursor-pointer w-full ${className}`}
      style={{ maxWidth }}
      onClick={handleCopy}
      role="button"
      tabIndex={0}
    >
      <code className="font-mono text-xs text-gray-700 truncate overflow-hidden">{code || placeholder}</code>
      <div className="relative ml-6 flex-shrink-0">
        {copied ? (
          <Check className="h-4 w-4 text-black transition-all" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500 transition-all group-hover:text-gray-700" />
        )}
      </div>
    </div>
  )
} 