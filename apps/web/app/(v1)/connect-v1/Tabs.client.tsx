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
  const [value, setValue] = useStateFromHash(
    paramKey,
    props.defaultValue,
  )

  return <Tabs {...props} value={value} onValueChange={setValue} />
}

export function useStateFromSearchParams<T extends string>(
  key: string,
  defaultValue?: T,
): [T | undefined, (value: T) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const value = searchParams.get(key) as T | null

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams)
      params.set(key, newValue)
      router.push(`?${params.toString()}`)
    },
    [key, router, searchParams],
  )

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
      return window.location.hash.slice(1); // Remove the # character
    }
    return '';
  });

  // Update hash state when browser's hash changes
  React.useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Parse the hash string to get the value
  const value = React.useMemo(() => {
    if (!hash) return undefined;

    try {
      const params = new URLSearchParams(hash);
      return params.get(key) as T | null || undefined;
    } catch (e) {
      return undefined;
    }
  }, [hash, key]);

  const setValue = useCallback((newValue: T) => {
    const params = new URLSearchParams(hash || '');
    params.set(key, newValue);

    // Update the hash without causing navigation
    window.history.pushState(null, '', `#${params.toString()}`);
    setHash(params.toString());
  }, [hash, key]);

  return [value || defaultValue, setValue];
}
