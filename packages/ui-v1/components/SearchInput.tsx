'use client'

import {Search} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Input} from '@openint/shadcn/ui'

interface SearchInputProps {
  initialValue?: string
  onChange: (value: string) => void
  className?: string
  debounceMs?: number
}

export function SearchInput({
  initialValue,
  onChange,
  className,
  debounceMs = 400,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const [value, setValue] = useState(initialValue)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Debounced handleChange to prevent unnecessary calls
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }

  return (
    <div
      className={cn(
        'relative max-w-lg transition-all duration-300 ease-in-out',
        className,
        isFocused && 'w-[600px]',
        !isFocused && 'w-[400px]',
      )}>
      {isFocused && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 opacity-100 transition-opacity duration-300 ease-in-out" />
      )}
      <Input
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        className={`transition-all duration-300 ease-in-out ${
          isFocused ? 'pl-10' : 'pl-3'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
}
