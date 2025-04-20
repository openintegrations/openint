import type React from 'react'
import type {TypedHref} from '@/lib-common/Link'
import type {PageProps} from '@/lib-common/next-utils'

import {ArrowRight, Check, Code, Globe, Webhook} from 'lucide-react'
import {Button} from '@openint/shadcn/ui/button'
import {Progress} from '@openint/shadcn/ui/progress'
import {Link} from '@/lib-common/Link'
import {getServerComponentContext} from '@/lib-server/trpc.server'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  href: TypedHref
  isCompleted: boolean
}

export default async function GettingStartedSteps(pageProps: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(pageProps)

  const abc = await queryClient.fetchQuery(
    trpc.listConnectorConfigs.queryOptions({limit: 1}),
  )

  const ccfgsPromise = queryClient.fetchQuery(
    trpc.listConnectorConfigs.queryOptions({limit: 1}),
  )
  const connsPromise = queryClient.fetchQuery(
    trpc.listConnections.queryOptions({limit: 1}),
  )
  const eventsPromise = queryClient.fetchQuery(
    trpc.listEvents.queryOptions({limit: 1}),
  )

  const [ccfgs, conns, events] = (await Promise.all([
    ccfgsPromise,
    connsPromise,
    eventsPromise,
  ] as unknown[])) as [
    Awaited<typeof ccfgsPromise>,
    Awaited<typeof connsPromise>,
    Awaited<typeof eventsPromise>,
  ]

  const steps: Step[] = [
    {
      id: 1,
      title: 'Configure Connector',
      description:
        'Set up your connector to establish a secure connection with our service.',
      icon: <Globe className="h-5 w-5" />,
      href: '/console/connector-config',
      isCompleted: ccfgs.items.length > 0,
    },
    {
      id: 2,
      title: 'Embed Connect',
      description:
        'Add our connection script to your application to enable seamless integration.',
      icon: <Code className="h-5 w-5" />,
      href: '/console/connect',
      isCompleted: conns.items.length > 0,
    },
    {
      id: 3,
      title: 'Receive Webhook',
      description:
        'Set up webhook endpoints to receive real-time updates and retrieve credentials.',
      icon: <Webhook className="h-5 w-5" />,
      href: '/console/settings',
      // TODO: Check that event has actually be acknowledged
      isCompleted: events.items.length > 0,
    },
  ]

  const totalSteps = steps.length
  const completedCount = steps.filter((step) => step.isCompleted).length
  const progressPercentage = (completedCount / totalSteps) * 100

  return (
    <div className="max-w-2xl space-y-6 p-4">
      <div className="mb-4">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-muted-foreground mt-2 text-sm">
          {completedCount === totalSteps
            ? 'All steps completed'
            : `${completedCount}/${totalSteps} steps completed`}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = step.isCompleted

          return (
            <div
              key={step.id}
              className={`rounded-lg border p-4 ${isCompleted ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30' : ''}`}>
              <div className="flex items-start space-x-4">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-foreground font-medium">{step.title}</h4>
                  <p className="text-foreground/80 text-sm">
                    {step.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`rounded-full p-2 ${isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                    {step.icon}
                  </div>
                </div>
              </div>
              <div className="mt-4 pl-12">
                <Button
                  asChild
                  variant={isCompleted ? 'outline' : 'default'}
                  size="sm"
                  className={
                    isCompleted
                      ? 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700'
                      : ''
                  }>
                  <Link href={step.href}>
                    {isCompleted ? 'View Details' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
