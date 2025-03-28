import {init as initCommandBar} from 'commandbar'
import {useTheme} from 'next-themes'
import {useRouter} from 'next/navigation'
import React from 'react'
import {env} from '@openint/app-config/env'
import {prepareCommands} from '@openint/commands'
import {vDefinitions} from '@/vcommands/vcommand-definitions'
import {useViewerContext} from '../components/viewer-context'

export function GlobalCommandBar() {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    if (env.NEXT_PUBLIC_COMMANDBAR_ORG_ID) {
      initCommandBar(env.NEXT_PUBLIC_COMMANDBAR_ORG_ID)
      setReady(true)
    }
  }, [])
  return ready ? <GlobalCommandBarInner /> : null
}

const {commands} = prepareCommands({definitions: vDefinitions})

function GlobalCommandBarInner() {
  const {viewerId} = useViewerContext()
  const {resolvedTheme} = useTheme()
  const router = useRouter()

  React.useEffect(() => {
    for (const cmd of commands) {
      void window.CommandBar.addCommand({
        name: cmd.key,
        text: cmd.title,
        explanation: cmd.subtitle,
        template: {type: 'link', value: '', operation: 'router'},
      })
    }
    const connections = [
      {
        id: 'conn_1',
        label: 'Connection 1 plaid',
      },
      {
        id: 'conn_2',
        label: 'Connection postgres 2',
      },
    ]
    window.CommandBar.addRecords('connections', connections)

    window.CommandBar.addMetadata('activeConnection', connections[0])
    void window.CommandBar.addCommand({
      name: 'test',
      text: 'Test',
      arguments: {
        book: {
          type: 'context',
          value: 'connections',
          order_key: 0,
          label: 'Select from the list below',
          preselected_key: 'activeConnection',
        },
        name: {
          type: 'provided',
          value: 'text',
          order_key: 0,
        },
      },
      template: {type: 'callback', value: 'test'},
    })
    void window.CommandBar.addRecordAction(
      'connections',
      {
        name: 'test2',
        text: 'Connection action 2',
        template: {type: 'callback', value: 'test2'},
        arguments: {
          name: {
            type: 'provided',
            value: 'text',
            order_key: 0,
          },
        },
      },
      false,
    )
    void window.CommandBar.addRecordAction(
      'connections',
      {
        name: 'test3',
        text: 'Connection action 3',
        template: {type: 'callback', value: 'test3'},
        arguments: {
          // Implicit argument of `record` is added
          name: {
            type: 'provided',
            value: 'text',
            order_key: 0,
          },
        },
      },
      false,
    )
    window.CommandBar.addCallbacks({
      test: (...args) => {
        console.log('cmdbar callback args', args)
      },
      test2: (...args) => {
        console.log('test 2 cmdbar callback args', args)
      },
      test3: (...args) => {
        console.log('test 3 cmdbar callback args', args)
      },
    })
  }, [])

  React.useEffect(() => {
    if (resolvedTheme) {
      window.CommandBar.setTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  React.useEffect(() => {
    // No-way to undo addRouter
    window.CommandBar.addRouter((url) => {
      console.debug('[CommandBarContext] Trying to nav to route', url)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      router.push(url as any)
    })
  }, [router])

  React.useEffect(() => {
    void window.CommandBar.boot(viewerId)
  }, [viewerId])

  return null
}
