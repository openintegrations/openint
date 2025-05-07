'use client'

import React from 'react'
import {Tabs} from '@openint/shadcn/ui'
import {useStateFromSearchParams} from '@openint/ui-v1'

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
