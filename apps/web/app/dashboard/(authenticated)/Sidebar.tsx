import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {__DEBUG__} from '@openint/app-config/constants'
import type {IconName} from '@openint/ui'
import {Button, ScrollArea} from '@openint/shadcn/ui'
import {Icon} from '@openint/ui/components'
import {R} from '@openint/util'
import {cn} from '@/lib-client/ui-utils'

type TypedHref = Extract<React.ComponentProps<typeof Link>['href'], string>
interface LinkItem {
  href: TypedHref
  title: string
  icon?: IconName
}

const links: Array<{
  title?: string
  items: LinkItem[]
}> = [
  {
    items: R.compact<LinkItem>([
      // {
      //   title: 'Home',
      //   href: '/',
      //   icon: 'Home',
      // },
      {
        title: 'Connect',
        href: '/dashboard/connect',
        icon: 'Wand',
      },
      {
        title: 'Customers',
        href: '/dashboard/customers',
        icon: 'Users',
      },
      {
        title: 'Connections',
        href: '/dashboard/connections',
        icon: 'Box',
      },
      {
        title: 'Connector Configs',
        href: '/dashboard/connector-configs',
        icon: 'Layers',
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: 'Settings',
      },
      {
        title: 'API Docs',
        href: 'https://docs.openint.dev',
        icon: 'FileText',
      },
    ]),
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({className}: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col', className)}>
      <ScrollArea className="h-full px-2">
        <div className="space-y-4 py-4">
          {links.map((section, i) => (
            <div key={section.title ?? `i-${i}`} className="px-4 py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    target={
                      link.href.startsWith('http') ? '_blank' : undefined
                    }>
                    <Button
                      variant={
                        pathname === link.href ||
                        pathname?.startsWith(link.href + '/')
                          ? 'outline'
                          : 'ghost'
                      }
                      size="sm"
                      className="w-full justify-start">
                      {link.icon && (
                        <Icon name={link.icon} className="mr-2 h-4 w-4" />
                      )}
                      {link.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 flex items-start p-2 px-4 text-sm text-gray-400">
            <Icon name="Info" className="mr-2 h-5 w-5 text-gray-400" />
            <span>
              Access command shortcut with <kbd>cmd</kbd> + <kbd>k</kbd>
            </span>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-7">
        <Button
          variant="default"
          size="sm"
          className="mb-4 w-full justify-center"
          onClick={() =>
            window.open('https://cal.com/ap-openint/discovery', '_blank')
          }>
          Book A Demo
        </Button>
        <Link
          className="flex flex-row items-center gap-2 font-semibold hover:opacity-90"
          href="/">
          <Image
            width={146}
            height={40}
            src="/openint-logo.svg"
            alt="OpenInt"
          />
          {/* OpenInt */}
        </Link>
      </div>
    </nav>
  )
}
