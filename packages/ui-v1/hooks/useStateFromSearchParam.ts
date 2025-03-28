'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import React from 'react'

export function useStateFromSearchParams<T extends string>(
  key: string,
  options?: {
    defaultValue?: T
    shallow?: boolean
  },
): [T | undefined, (value: T) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const value = searchParams.get(key) as T | null
  const {defaultValue, shallow = false} = options || {}

  const setValue = React.useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams)

      if (newValue === defaultValue) {
        // Remove the parameter if it equals the default value
        params.delete(key)
      } else {
        // Otherwise set it as normal
        params.set(key, newValue)
      }

      // we need the ? regardless otherwise the URL will not be updated
      // in case all params got deleted
      const queryString = `?${params.toString()}`

      if (shallow) {
        // Use window.history to avoid full page reload

        window.history.pushState(null, '', queryString)
      } else {
        // Use router for normal navigation
        router.push(queryString)
      }
    },
    [key, router, searchParams, shallow, defaultValue],
  )
  // console.log('useStateFromSearchParams', key, value, defaultValue)

  return [value || defaultValue, setValue]
}
