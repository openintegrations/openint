'use client'

import Image from 'next/image'
import type React from 'react'
import {useState} from 'react'
import {toast} from 'sonner'
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
import {Dialog, DialogContent} from '@openint/shadcn/ui/dialog'
import {Input} from '@openint/shadcn/ui/input'
import {Label} from '@openint/shadcn/ui/label'

type OnboardingStep = 'organization' | 'connector'
type ConnectorName = 'github' | 'calendar' | 'slack'

interface ConnectorOption {
  id: ConnectorName
  title: string
  description: string
  logoUrl: string
}

const connectorOptions: ConnectorOption[] = [
  {
    id: 'calendar',
    title: 'Google Calendar',
    description: 'Connect your calendar to sync events and meetings',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1200px-Google_Calendar_icon_%282020%29.svg.png',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Sync your repositories and track development workflow',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
  },
  {
    id: 'slack',
    title: 'Slack',
    description: "Integrate with your team's communication hub",
    logoUrl:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Slack_logo-512.png',
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
  const [step, setStep] = useState<OnboardingStep>(initialStep)
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
      setStep('connector')
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
          style={{height: 'auto', maxHeight: '90vh'}}>
          {step === 'organization' ? (
            <div className="flex h-[550px] flex-col justify-center">
              <div className="mb-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    1
                  </div>
                  <div className="bg-muted-foreground/30 h-0.5 w-6"></div>
                  <div className="border-muted-foreground/30 text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                    2
                  </div>
                </div>
              </div>

              <div className="mb-4 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        d="M30,50 L70,50"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        d="M50,30 L50,70"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
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
                  <p>You&apos;ll be able to add team members after setup</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[550px] flex-col">
              <div className="mb-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/20 text-primary flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    ✓
                  </div>
                  <div className="bg-primary h-0.5 w-6"></div>
                  <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    2
                  </div>
                </div>
              </div>

              <div className="mb-4 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        d="M30,50 L70,50"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        d="M50,30 L50,70"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-1 text-lg font-semibold">
                  Welcome to OpenInt!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sexy Integrations for Developers
                </p>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="mb-3 text-center text-sm font-medium">
                  Select your first to start:
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {connectorOptions.map((connector) => (
                    <Card key={connector.id} className="h-auto p-0">
                      <CardHeader className="space-y-0 px-4 pb-0 pt-4">
                        <div className="mb-3 flex justify-center">
                          <div className="relative h-14 w-14">
                            <Image
                              src={connector.logoUrl}
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

                <div className="mt-auto pt-2 text-center">
                  <Button
                    variant="link"
                    onClick={handleFindMore}
                    className="text-muted-foreground text-sm">
                    or find more
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
    </>
  )
}
