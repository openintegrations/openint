'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useCallback} from 'react'
import {Tabs} from '@openint/shadcn/ui'

/**
 * Tabs that automatically sync with search params
 * However this does not work very well so far because it causes the entire server side route to reload
 * which is not actually intentional
 *
 */
export function TabsClient({
  searchParamKey,
  ...props
}: Omit<React.ComponentProps<typeof Tabs>, 'value' | 'onValueChange'> & {
  searchParamKey: string
}) {
  const [value, setValue] = useStateFromSearchParams(
    searchParamKey,
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
