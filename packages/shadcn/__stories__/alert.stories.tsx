// packages/shadcn/__stories__/alert.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'
import {AlertCircleIcon, CheckCircleIcon, InfoIcon} from 'lucide-react'
import {Alert, AlertDescription, AlertTitle} from '../ui/alert'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Shadcn/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

// Default Alert
export const Default: Story = {
  render: () => (
    <Alert>
      <InfoIcon />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is a default alert with an information message.
      </AlertDescription>
    </Alert>
  ),
}

// Destructive Alert
export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

// Success Alert
export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 text-green-700">
      <CheckCircleIcon className="text-green-700" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription className="text-green-600">
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
}

// Alert without icon
export const WithoutIcon: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>
        This is an alert without an icon. It still provides important
        information.
      </AlertDescription>
    </Alert>
  ),
}
