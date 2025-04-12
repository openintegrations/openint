import type React from 'react'
import type {RouteImpl} from './Link.types'

import NextLink from 'next/link'
import {resolveRoute} from '@openint/env'

export type LinkProps = React.ComponentProps<typeof NextLink>

export type UrlObject = Exclude<LinkProps['href'], string>

export function Link<RouteType>({
  href,
  ...props
}: {href: RouteImpl<RouteType> | UrlObject} & Omit<LinkProps, 'href'>) {
  const [route] = typeof href === 'string' ? resolveRoute(href, null) : [href]
  return <NextLink href={route as LinkProps['href']} {...props} />
}
