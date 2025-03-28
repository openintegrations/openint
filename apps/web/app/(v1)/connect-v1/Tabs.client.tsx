'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import React, {useCallback} from 'react'
import {Tabs} from '@openint/shadcn/ui'

/**
 * Tabs that automatically sync with search params
 * However this does not work very well so far because it causes the entire server side route to reload
 * which is not actually intentional
 *
 */
export function TabsClient({
  paramKey,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> & {
  paramKey: string
}) {
  const [value, setValue] = useStateFromSearchParams(paramKey, {
    defaultValue: props.defaultValue,
    shallow: true,
  })

  return <Tabs {...props} value={value} onValueChange={setValue} />
}

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

/**
 * Hook to manage state using the URL hash instead of search params
 * This avoids triggering a full page reload when changing values
 * However this causes an initial flash...
 */
export function useStateFromHash<T extends string>(
  key: string,
  defaultValue?: T,
): [T | undefined, (value: T) => void] {
  const [hash, setHash] = React.useState(() => {
    // Only access window on client side
    if (typeof window !== 'undefined') {
      return window.location.hash.slice(1) // Remove the # character
    }
    return ''
  })

  // Update hash state when browser's hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Parse the hash string to get the value
  const value = React.useMemo(() => {
    if (!hash) return undefined

    try {
      const params = new URLSearchParams(hash)
      return (params.get(key) as T | null) || undefined
    } catch (e) {
      return undefined
    }
  }, [hash, key])

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(hash || '')
      params.set(key, newValue)

      // Update the hash without causing navigation
      window.history.pushState(null, '', `#${params.toString()}`)
      setHash(params.toString())
    },
    [hash, key],
  )

  return [value || defaultValue, setValue]
}
