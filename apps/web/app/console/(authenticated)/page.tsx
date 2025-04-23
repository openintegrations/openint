import type React from 'react'
import type {TypedHref} from '@/lib-common/Link'
import type {PageProps} from '@/lib-common/next-utils'

import {ArrowRight, Check, Code, Globe, Share} from 'lucide-react'
import {resolveRoute} from '@openint/env'
import {cn} from '@openint/shadcn/lib/utils'
import {Button} from '@openint/shadcn/ui/button'
import {Progress} from '@openint/shadcn/ui/progress'
import {Confetti} from '@openint/ui-v1/components/Confetti'
import {VideoEmbed} from '@openint/ui-v1/components/VideoEmbed'
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

const VIDEO_ID = 'FpG7otZZhRw'

export default async function GettingStartedSteps(pageProps: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(pageProps)

  const onboardingState = await queryClient.fetchQuery(
    trpc.getOnboarding.queryOptions(),
  )

  const steps: Step[] = [
    {
      id: 1,
      title: 'Configure Connector',
      description:
        'Set up your first connector to being your integration journey.',
      icon: <Globe className="h-5 w-5" />,
      href: '/console/connector-config',
      isCompleted: onboardingState.first_connector_configured,
    },
    {
      id: 2,
      title: 'Create a Connection',
      description: 'Create your first connection using @Connect.',
      icon: <Code className="h-5 w-5" />,
      href: '/console/connect',
      isCompleted: onboardingState.first_connection_created,
    },
    {
      id: 3,
      title: 'Embed @Connect',
      description:
        'Generate a token with your API Key and embed @Connect in your application.',
      icon: <Share className="h-5 w-5" />,
      href: '/console/settings',
      isCompleted: onboardingState.api_key_used,
    },
  ]

  const totalSteps = steps.length
  const completedCount = steps.filter((step) => step.isCompleted).length
  const progressPercentage = (completedCount / totalSteps) * 100
  const allStepsCompleted = completedCount === totalSteps

  return (
    <div className="mx-auto w-full space-y-6 p-4">
      <Confetti isActive={allStepsCompleted} duration={3000} />

      <div className="mb-4">
        {!allStepsCompleted && (
          <Progress value={progressPercentage} className="h-2" />
        )}
        <p className="text-muted-foreground text-md mt-2">
          {allStepsCompleted
            ? 'Onboarding Complete! 🎉'
            : `${completedCount}/${totalSteps} steps completed`}
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="space-y-4 md:w-1/2">
          {steps.map((step) => {
            const isCompleted = step.isCompleted
            const [route] = resolveRoute(step.href, null)

            return (
              <div
                key={step.id}
                className={cn(
                  'rounded-lg border p-4',
                  isCompleted &&
                    'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30',
                )}>
                <div className="flex items-start space-x-4">
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                      isCompleted
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-muted text-muted-foreground',
                    )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-foreground font-medium">
                      {step.title}
                    </h4>
                    <p className="text-foreground/80 text-sm">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'rounded-full p-2',
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-muted',
                      )}>
                      {step.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-5.5 flex justify-end pl-12">
                  <Button
                    asChild
                    variant={isCompleted ? 'outline' : 'default'}
                    size="sm"
                    className={cn(
                      isCompleted
                        ? 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700'
                        : '',
                    )}>
                    <Link href={route as TypedHref}>
                      {isCompleted ? 'View Details' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="md:w-1/2">
          <VideoEmbed videoId={VIDEO_ID} title="OpenInt Introduction" />
        </div>
      </div>
      {/* 
      {allStepsCompleted && !onboardingState.onboarding_marked_complete && (
        <form
          action={async () => {
            'use server'
            let loadingToastId: string | undefined
            const {trpc} = await getServerComponentContext()
            const setOnboardingComplete = useMutation(
              trpc.setOnboardingComplete.mutationOptions({
                onMutate: (_variables) => {
                  loadingToastId = toast.loading(
                    'Marking onboarding as complete...',
                  )
                },
                onSuccess: () => {
                  toast.dismiss(loadingToastId)
                  toast.success('Onboarding marked as complete!')
                },
                onError: (error) => {
                  toast.dismiss(loadingToastId)
                  toast.error(`Onboarding marking failed: ${error.message}`) 
                },
                onSettled: () => {
                  void queryClient.invalidateQueries({
                    queryKey: trpc.listConnections.queryKey(),
                  })
                },
              }),
            )

            await setOnboardingComplete.mutate()
          }}>
          <Button type="submit" className="w-full">
            Mark Onboarding Complete
          </Button>
        </form>
      )} */}
    </div>
  )
}
