'use client'

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@openint/shadcn/ui/dialog'
import {Input} from '@openint/shadcn/ui/input'
import {Label} from '@openint/shadcn/ui/label'
import {cn} from '@/lib-client/ui-utils'

type OnboardingStep = 'organization' | 'connector'
type ConnectorType = 'github' | 'calendar' | 'slack'

interface ConnectorOption {
  id: ConnectorType
  title: string
  description: string
}

const connectorOptions: ConnectorOption[] = [
  {
    id: 'calendar',
    title: 'Google Calendar',
    description: 'Connect your calendar to sync events and meetings',
  },
  {
    id: 'github',
    title: 'GitHub',
    description: 'Sync your repositories and track development workflow',
  },
  {
    id: 'slack',
    title: 'Slack',
    description: "Integrate with your team's communication hub",
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
          return `${orgPart.charAt(0).toUpperCase() + orgPart.slice(1)}`
        }
      }

      return `${organizationName.charAt(0).toUpperCase() + organizationName.slice(1)}`
    }
    if (userFirstName && userFirstName.length > 1) {
      return `${userFirstName.charAt(0).toUpperCase() + userFirstName.slice(1).toLowerCase()}'s Acme Org`
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
    connectorType?: ConnectorType,
  ) => void
  initialStep?: OnboardingStep
  className?: string
}) {
  const [step, setStep] = useState<OnboardingStep>(initialStep)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingConnector, setLoadingConnector] =
    useState<ConnectorType | null>(null)
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

  const handleConnectorSelect = async (connectorType: ConnectorType) => {
    setLoadingConnector(connectorType)
    navigateTo('setupConnector', connectorType)
  }

  const handleFindMore = () => {
    navigateTo('listConnectors')
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent className={cn('sm:max-w-[500px]', className)}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Welcome aboard!</DialogTitle>
            </div>
          </DialogHeader>

          {step === 'organization' ? (
            <form onSubmit={handleOrgSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName">Organization name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Setting up...' : 'Create organization'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to OpenInt!</h3>
                <p className="text-muted-foreground text-sm">
                  Sexy Integrations for Developers
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm">Select your first to start:</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {connectorOptions.map((connector) => (
                    <Card key={connector.id} className="relative">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {connector.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {connector.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
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
              You haven't finished setting up your first connector. Are you sure
              you want to quit the setup process?
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
