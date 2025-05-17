import type {Meta, StoryObj} from '@storybook/react'

import {Button} from '@openint/shadcn/ui'
import {ConnectTransitionWindow} from './ConnectTransitionWindow'
import {LoadingSpinner} from './LoadingSpinner'

const meta: Meta<typeof ConnectTransitionWindow> = {
  component: ConnectTransitionWindow,
  title: 'UI/ConnectTransitionWindow',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ConnectTransitionWindow>

export const Success: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Successfully connected to Google Drive
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          You can close this window and return to the application
        </p>
        <LoadingSpinner className="mt-4" />
      </div>
    ),
  },
}

export const Error: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          There was an Error connecting to Google Drive
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          <b>Error:</b> Authentication failed. Please try again.
        </p>
      </div>
    ),
  },
}

export const WithAutoClose: Story = {
  args: {
    autoCloseInMs: 5000,
    children: (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Successfully connected to GitHub
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This window will automatically close in 5 seconds
        </p>
        <LoadingSpinner className="mt-4" />
      </div>
    ),
  },
}

export const WithCloseButton: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Successfully connected to Dropbox
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account has been successfully linked
        </p>
        <Button className="mt-4" onClick={() => alert('Close button clicked')}>
          Close Window
        </Button>
      </div>
    ),
  },
}

export const Navigation: Story = {
  args: {
    children: (
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium">Navigating to Google Drive...</p>
        <p className="text-sm text-gray-500">You will be redirected shortly</p>
      </div>
    ),
  },
}
