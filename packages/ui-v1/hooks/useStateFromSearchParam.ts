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
  const [searchParams, setSearchParams] = useMutableSearchParams()
  const value = searchParams.get(key) as T | null
  const {defaultValue, shallow = false} = options || {}

  const setValue = React.useCallback(
    (newValue: T) => {
      setSearchParams(
        (params) => {
          if (newValue === defaultValue) {
            // Remove the parameter if it equals the default value
            params.delete(key)
          } else {
            // Otherwise set it as normal
            params.set(key, newValue)
          }
        },
        {shallow},
      )
    },
    [key, setSearchParams, shallow, defaultValue],
  )

  return [value || defaultValue, setValue]
}

export function useMutableSearchParams() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const setSearchParams = React.useCallback(
    (
      updater: ((params: URLSearchParams) => void) | Record<string, string>,
      options?: {
        shallow?: boolean
      },
    ) => {
      const params = new URLSearchParams(searchParams)

      if (typeof updater === 'function') {
        updater(params)
      } else {
        Object.entries(updater).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            params.delete(key)
          } else {
            params.set(key, value)
          }
        })
      }

      const queryString = `?${params.toString()}`

      if (options?.shallow) {
        window.history.pushState(null, '', queryString)
      } else {
        router.push(queryString)
      }
    },
    [router, searchParams],
  )

  return [searchParams, setSearchParams] as const
}
