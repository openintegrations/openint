import React from 'react'

/**
 * Hook to manage state using the URL hash instead of search params
 * This avoids triggering a full page reload when changing values
 * However this causes an initial flash...
 */
export function useStateFromHashParam<T extends string>(
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

  const setValue = React.useCallback(
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
