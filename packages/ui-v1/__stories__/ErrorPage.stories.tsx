import type {Meta, StoryObj} from '@storybook/react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from '@openint/shadcn/ui'
import {CopyID} from '../components/CopyID'
import {FullScreenCenter} from '../components/FullScreenCenter'
import {Icon} from '../components/Icon'

// Import the types from the error page
type PageError = Error & {
  name: string
  message: string
  digest?: string
  environmentName?: string
}

interface ErrorPageProps {
  error: PageError
  reset?: () => void
}

// Recreate the WarningIcon component
const WarningIcon = () => (
  <div className="mb-3">
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="35" r="35" fill="var(--destructive)" />
      <path
        d="M35 15V40"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="35" cy="53" r="4" fill="white" />
    </svg>
  </div>
)

// Recreate a simple version of the error page for Storybook
// This avoids import issues with the Next.js app directory
function ErrorPageStory({error, reset}: ErrorPageProps) {
  // Simple formatter for the demo
  const formatError = (err: PageError) => {
    if (err.name === 'ZodError') return 'Search params not matching schema'
    if (err.name === 'TRPCError') return 'Server error'
    return err.message || 'An unknown error has occurred'
  }

  const formattedError = formatError(error)
  const errorId = `${error.environmentName || 'Client'}:${error.digest || 'unknown'}`

  return (
    <FullScreenCenter className="justify-start pt-12">
      <div className="flex max-w-xl flex-col items-center gap-5 p-4 text-center">
        <WarningIcon />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {formattedError}
          </h1>
        </div>

        {reset && (
          <Button
            size="lg"
            variant="default"
            className="mt-2 flex items-center gap-2 rounded-lg px-10 py-5 text-base font-medium shadow-sm"
            onClick={reset}>
            <Icon name="RefreshCcw" className="h-4 w-4" />
            Retry
          </Button>
        )}

        <div className="text-muted-foreground mt-3 text-base">
          <p>
            If issue persists, please contact support with the following
            identifier:
          </p>
          <div className="mt-2 flex justify-center">
            <CopyID value={errorId} size="medium" className="mx-auto" />
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-6 w-full max-w-md">
          <AccordionItem
            value="details"
            className="border-border bg-card rounded-lg border shadow-sm">
            <AccordionTrigger className="px-6 py-3 text-base font-medium hover:no-underline">
              Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 pt-2">
                <div className="bg-secondary-foreground overflow-hidden rounded-md shadow-inner">
                  <div className="p-4 text-sm">
                    <div className="text-background whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(error, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </FullScreenCenter>
  )
}

// Storybook configuration
const meta: Meta<typeof ErrorPageStory> = {
  title: 'Pages/ErrorPage',
  component: ErrorPageStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ErrorPageStory>

/**
 * An example of a validation error with a reset button.
 */
export const ValidationError: Story = {
  args: {
    error: {
      name: 'ZodError',
      message: 'Search params not matching schema',
      environmentName: 'Client',
      digest: '1214259461',
    },
    reset: () => {
      alert('Reset clicked')
    },
  },
}

/**
 * An example of a server-side error without a reset button.
 */
export const ServerError: Story = {
  args: {
    error: {
      name: 'TRPCError',
      message: 'Internal Server Error',
      environmentName: 'Server',
      digest: '4059953678',
    },
  },
}

/**
 * An example of a runtime JavaScript error.
 */
export const RuntimeError: Story = {
  args: {
    error: {
      name: 'TypeError',
      message: "Cannot read properties of undefined (reading '_def')",
      environmentName: 'Client',
      digest: '1214259461',
    },
    reset: () => {
      alert('Reset clicked')
    },
  },
}

/**
 * An example of a network error.
 */
export const NetworkError: Story = {
  args: {
    error: {
      name: 'Error',
      message: 'Failed to fetch data: Network error',
      environmentName: 'Client',
      digest: '3384772109',
    },
    reset: () => {
      alert('Reset clicked')
    },
  },
}
