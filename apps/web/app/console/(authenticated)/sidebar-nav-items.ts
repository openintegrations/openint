import type NextLink from 'next/link'
import type React from 'react'
import type {IconName} from '@openint/ui-v1/components'

import {resolveRoute} from '@openint/env'

type Href = React.ComponentProps<typeof NextLink>['href']

export const SIDEBAR_NAV_ITEMS = (
  [
    {
      title: 'Dashboard',
      url: '/console',
      icon: 'Box',
    },
    {
      title: 'Connect',
      url: '/console/connect',
      icon: 'Wand',
    },
    {
      title: 'Connector Configs',
      url: '/console/connector-config',
      icon: 'Layers',
    },
    {
      title: 'Events',
      url: '/console/events',
      icon: 'Database',
    },
    {
      title: 'Customers',
      url: '/console/customers',
      icon: 'Users',
    },
    {
      title: 'Connections',
      url: '/console/connections',
      icon: 'Box',
    },
    {
      title: 'Settings',
      url: '/console/settings',
      icon: 'Settings',
    },
    {
      title: 'API Docs',
      url: 'https://docs.openint.dev',
      icon: 'ExternalLink',
    },
  ] satisfies Array<{
    title: string
    url: string
    icon: IconName
  }>
).map((item) => ({
  ...item,
  url: resolveRoute(item.url, null)[0] as Extract<Href, string>,
}))
