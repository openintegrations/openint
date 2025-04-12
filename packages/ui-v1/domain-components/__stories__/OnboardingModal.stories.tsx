import type {Meta, StoryObj} from '@storybook/react'

import {OnboardingModal} from '../OnboardingModal'

const meta: Meta<typeof OnboardingModal> = {
  component: OnboardingModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    email: {
      control: 'text',
      description: 'User email address used to suggest an organization name',
    },
    userFirstName: {
      control: 'text',
      description: 'User first name used to suggest an organization name',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
    },
    initialStep: {
      control: 'radio',
      options: ['organization', 'connector'],
      description: 'The initial step to show in the modal',
    },
    createOrganization: {
      action: 'createOrganization',
      description: 'Function called when creating a new organization',
    },
    navigateTo: {
      action: 'navigateTo',
      description: 'Function called to navigate to different parts of the app',
    },
  },
} satisfies Meta<typeof OnboardingModal>

export default meta
type Story = StoryObj<typeof OnboardingModal>

// Mock functions for all stories
const mockCreateOrganization = async (name: string) => {
  console.log('Creating organization:', name)
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

const mockNavigateTo = (
  option: 'listConnectors' | 'setupConnector' | 'dashboard',
  connectorName?: string,
) => {
  console.log(
    'Navigating to:',
    option,
    connectorName ? `with connector: ${connectorName}` : '',
  )
}

export const NewUserWithCompanyEmail: Story = {
  args: {
    email: 'user@company.com',
    isOpen: true,
    initialStep: 'organization',
    createOrganization: mockCreateOrganization,
    navigateTo: mockNavigateTo,
  },
  name: 'New User with Company Email',
}

export const NewUserWithGmail: Story = {
  args: {
    email: 'user@gmail.com',
    isOpen: true,
    initialStep: 'organization',
    createOrganization: mockCreateOrganization,
    navigateTo: mockNavigateTo,
  },
  name: 'New User with Gmail',
}

export const UserSelectingFirstConnector: Story = {
  args: {
    email: 'user@company.com',
    isOpen: true,
    initialStep: 'connector',
    createOrganization: mockCreateOrganization,
    navigateTo: mockNavigateTo,
  },
  name: 'User Selecting First Connector',
}
