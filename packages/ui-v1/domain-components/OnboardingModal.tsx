'use client'

import type React from 'react'

import Image from 'next/image'
import {useState} from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@openint/shadcn/ui/alert-dialog'
import {Button} from '@openint/shadcn/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@openint/shadcn/ui/card'
import {Dialog, DialogContent, DialogTitle} from '@openint/shadcn/ui/dialog'
import {Input} from '@openint/shadcn/ui/input'
import {Label} from '@openint/shadcn/ui/label'
import {toast} from '@openint/shadcn/ui/sonner'

type OnboardingStep = 'organization' | 'connector'
type ConnectorName = 'github' | 'calendar' | 'slack'

interface ConnectorOption {
  id: ConnectorName
  title: string
  description: string
  logo: string
}

const connectorOptions: ConnectorOption[] = [
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Connect your Google Calendar',
    logo: '/_assets/logo-google-calendar.svg',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Connect your Github',
    logo: '/_assets/logo-github.svg',
  },
  {
    id: 'slack',
    title: 'Slack',
    description: 'Connect your Slack',
    logo: '/_assets/logo-slack.svg',
  },
]

function getOrganizationName(
  email: string | undefined,
  userFirstName: string | undefined,
): string {
  try {
    const domain = email?.split('@')[1]
    const parts = domain?.split('.')
    const organizationName = parts?.[0]

    const isCustomDomain =
      !domain?.includes('gmail') &&
      !domain?.includes('hotmail') &&
      !domain?.includes('outlook')

    if (isCustomDomain && organizationName) {
      if (
        parts &&
        parts.length &&
        parts.length > 2 &&
        parts[parts.length - 3]?.length
      ) {
        const orgPart = parts[parts.length - 3]
        if (orgPart) {
          return orgPart.charAt(0).toUpperCase() + orgPart.slice(1)
        }
      }

      return (
        organizationName.charAt(0).toUpperCase() + organizationName.slice(1)
      )
    }
    if (userFirstName && userFirstName.length > 1) {
      return `${userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1).toLowerCase()}&apos;s Acme Org`
    }
  } catch (error) {
    console.error(
      'Error getting organization name. Defaulting to Acme Corp.',
      error,
    )
  }

  return `Acme Corp ${Math.floor(Math.random() * 16 ** 4)
    .toString(16)
    .padStart(4, '0')}`
}

export function OnboardingModal({
  email,
  userFirstName,
  isOpen = true,
  createOrganization,
  navigateTo,
  initialStep = 'organization',
  className,
}: {
  email?: string
  userFirstName?: string
  isOpen?: boolean
  createOrganization: (name: string) => Promise<void>
  navigateTo: (
    option: 'listConnectors' | 'setupConnector' | 'dashboard',
    connectorName?: string,
  ) => void
  initialStep?: OnboardingStep
  className?: string
}) {
  const [step] = useState<OnboardingStep>(initialStep)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingConnector, setLoadingConnector] =
    useState<ConnectorName | null>(null)
  const [orgName, setOrgName] = useState(
    getOrganizationName(email, userFirstName),
  )

  const handleClose = () => {
    if (step === 'organization' || step === 'connector') {
      setShowExitDialog(true)
    }
  }

  const handleExitConfirm = () => {
    navigateTo('dashboard')
  }

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      await createOrganization(orgName)
      navigateTo('dashboard')
      // setStep('connector')
    } catch (error) {
      toast.error('Failed to create organization', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      })
      console.error('Error creating organization:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnectorSelect = async (connectorType: ConnectorName) => {
    setLoadingConnector(connectorType)
    navigateTo('setupConnector', connectorType)
  }

  const handleFindMore = () => {
    navigateTo('listConnectors')
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          handleClose()
        }}>
        <DialogContent
          className={`sm:max-w-[750px] ${className}`}
          style={{height: 'auto', maxHeight: '50vh', overflow: 'hidden'}}
          aria-description="Step by step onboarding process to set up your organization and integrations">
          <DialogTitle className="sr-only">Onboarding Setup</DialogTitle>
          {step === 'organization' ? (
            <div className="flex h-[500px] flex-col justify-center">
              <div className="mb-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all duration-300">
                    1
                  </div>
                  <div className="bg-muted-foreground/30 h-0.5 w-6 transition-all duration-500"></div>
                  <div className="border-muted-foreground/30 text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-all duration-300">
                    2
                  </div>
                </div>
              </div>

              <div className="mb-4 text-center">
                <div className="mb-4 flex justify-center">
                  <Image
                    width={147}
                    height={41}
                    src="/openint-logo.svg"
                    alt="OpenInt Logo"
                    priority
                  />
                </div>
                <h3 className="text-lg font-semibold">Create your workspace</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Let&apos;s set up your organization to get started with
                  OpenInt
                </p>
              </div>

              <div className="flex-1">
                <div className="bg-muted/30 mb-4 rounded-lg border p-6">
                  <form onSubmit={handleOrgSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="orgName" className="text-base">
                        Organization name
                      </Label>
                      <p className="text-muted-foreground mb-2 text-xs">
                        This will be the name of your workspace
                      </p>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => {
                          setOrgName(e.target.value)
                        }}
                        placeholder="e.g. Acme Corp"
                        disabled={isSubmitting}
                        required
                        className="h-10"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      size="lg">
                      {isSubmitting
                        ? 'Setting up...'
                        : 'Continue to integrations'}
                    </Button>
                  </form>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                  <p>You&apos;ll be able to add team members after</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[500px] flex-col">
              <div className="mb-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/20 text-primary flex h-5 w-5 items-center justify-center rounded-full text-xs transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 animate-[checkmark_0.5s_ease-in-out_0.2s_forwards]">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="bg-primary h-0.5 w-6 animate-[progressBar_0.5s_ease-in-out_forwards] transition-all duration-500"></div>
                  <div className="bg-primary text-primary-foreground flex h-5 w-5 animate-[pulse_0.5s_ease-in-out] items-center justify-center rounded-full text-xs transition-all duration-300">
                    2
                  </div>
                </div>
              </div>

              <div className="mb-4 text-center">
                <div className="mb-4 flex justify-center">
                  <Image
                    width={147}
                    height={41}
                    src="/openint-logo.svg"
                    alt="OpenInt Logo"
                    priority
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  Demo your first integration to get started:
                </p>
              </div>
              <div
                className="flex flex-col"
                style={{height: 'calc(100% - 140px)'}}>
                <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {connectorOptions.map((connector) => (
                    <Card key={connector.id} className="h-auto p-0">
                      <CardHeader className="space-y-0 px-4 pb-0 pt-4">
                        <div className="mb-3 flex justify-center">
                          <div className="relative h-14 w-14">
                            <Image
                              src={connector.logo}
                              alt={`${connector.title} logo`}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                        <CardTitle className="mb-1 text-center text-base">
                          {connector.title}
                        </CardTitle>
                        <CardDescription className="text-center text-xs">
                          {connector.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex justify-center px-4 pb-4 pt-2">
                        <Button
                          variant="default"
                          className="w-full"
                          size="default"
                          disabled={loadingConnector !== null}
                          onClick={() => handleConnectorSelect(connector.id)}>
                          {loadingConnector === connector.id
                            ? 'Connecting...'
                            : 'Connect'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleFindMore}
                    className="text-muted-foreground text-sm">
                    or choose another one
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven&apos;t finished setting up your first connector. Are you
              sure you want to quit the setup process?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitConfirm}>
              Yes, quit setup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <style>{`
        @keyframes progressBar {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes pulse {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes checkmark {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
