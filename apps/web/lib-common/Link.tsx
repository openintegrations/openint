import type React from 'react'
import type {RouteImpl} from './typed-routes'

import NextLink from 'next/link'
import {resolveRoute} from '@openint/env'

export type LinkProps = React.ComponentProps<typeof NextLink>

export type UrlObject = Exclude<LinkProps['href'], string>

export function Link<RouteType>({
  href: _href,
  absolute,
  ...props
}: {href: RouteImpl<RouteType> | UrlObject; absolute?: boolean} & Omit<
  LinkProps,
  'href'
>) {
  let href = _href as string | UrlObject
  if (typeof href === 'string') {
    const [route, baseURL] = resolveRoute(href, null)
    href = absolute ? new URL(route, baseURL).toString() : route
  }

  return <NextLink href={href as LinkProps['href']} {...props} />
}

export function resolveLinkPath<RouteType>(href: RouteImpl<RouteType>) {
  return resolveRoute(href, null)[0]
}
