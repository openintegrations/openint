import type {RouteImpl} from './Link.types'
import type {UrlObject} from 'url'

import NextLink from 'next/link'
import {resolveRoute} from '@openint/env'

type LinkProps = React.ComponentProps<typeof NextLink>

export function Link<RouteType>({
  href,
  ...props
}: {href: RouteImpl<RouteType> | UrlObject} & Omit<LinkProps, 'href'>) {
  const [route] = typeof href === 'string' ? resolveRoute(href, null) : [href]
  return <NextLink href={route as LinkProps['href']} {...props} />
}
