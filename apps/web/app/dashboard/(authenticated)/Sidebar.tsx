import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {__DEBUG__} from '@openint/app-config/constants'
import type {IconName} from '@openint/ui'
import {Button, Icon, ScrollArea} from '@openint/ui'
import {R} from '@openint/util'
import {cn} from '@/lib-client/ui-utils'

type TypedHref = Extract<React.ComponentProps<typeof Link>['href'], string>
interface LinkItem {
  href: TypedHref
  title: string
  icon?: IconName
}

const sectionedLinks: Array<{
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
        title: 'Magic Link',
        href: '/dashboard/magic-link',
        icon: 'Wand',
      },
      __DEBUG__ && {
        title: 'Metrics',
        href: '/dashboard/metrics',
        icon: 'BarChart2',
      },
    ]),
  },
  {
    title: 'Console',
    items: [
      {
        title: 'SQL Editor',
        href: '/dashboard/sql-editor',
        icon: 'Code',
      },
    ],
  },
  {
    title: 'Entities',
    items: [
      {
        title: 'End users',
        href: '/dashboard/end-users',
        icon: 'Users',
      },
      {
        title: 'Connections',
        href: '/dashboard/resources',
        icon: 'Box',
      },
      {
        title: 'Connector Configs',
        href: '/dashboard/connector-configs',
        icon: 'Layers',
      },
    ],
  },
  {
    title: 'Pipelines',
    items: [
      {
        title: 'Pipeline List',
        href: '/dashboard/pipelines',
        icon: 'ArrowLeftRight',
      },
      {
        title: 'Pipeline Runs',
        href: '/dashboard/pipeline-runs',
        icon: 'ArrowLeftRight',
      },
    ],
  },
  {
    title: 'Developers',
    items: [
      // {
      //   title: 'Logs',
      //   href: '/dashboard/logs',
      //   icon: 'Footprints',
      // },
      {
        title: 'API Key',
        href: '/dashboard/api-access',
        icon: 'Key',
      },
      {
        title: 'API Docs',
        href: 'https://docs.openint.dev',
        icon: 'Cpu',
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: 'Settings',
      },
    ],
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  hasPgConnection: boolean
}

export function Sidebar({className, hasPgConnection}: SidebarProps) {
  const pathname = usePathname()
  const links = hasPgConnection
    ? sectionedLinks
    : sectionedLinks.filter((s) => s.title !== 'Console')

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
        </div>
      </ScrollArea>
      <div className="mt-auto p-4">
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
