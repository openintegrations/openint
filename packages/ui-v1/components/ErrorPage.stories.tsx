import type {Meta, StoryObj} from '@storybook/react'

import {ErrorPage, PageError} from './ErrorPage'

const meta: Meta<typeof ErrorPage> = {
  title: 'Components/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ErrorPage>

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

/**
 * Example with a custom error formatter that transforms the error message.
 */
export const CustomFormatter: Story = {
  args: {
    error: {
      name: 'ApiError',
      message: 'API_RATE_LIMIT_EXCEEDED',
      environmentName: 'Client',
      digest: '7812930456',
    },
    formatError: (error) => {
      // Custom formatter that provides user-friendly messages for error codes
      const err = error as PageError
      const errorMessages: Record<string, string> = {
        API_RATE_LIMIT_EXCEEDED:
          'You have exceeded the API rate limit. Please try again later.',
        AUTHENTICATION_FAILED:
          'Your session has expired. Please sign in again.',
        RESOURCE_NOT_FOUND: 'The requested resource could not be found.',
      }

      return errorMessages[err.message] || err.message
    },
    reset: () => {
      alert('Reset clicked')
    },
  },
}
