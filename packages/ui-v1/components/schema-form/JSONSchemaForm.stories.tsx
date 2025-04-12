import type {Meta, StoryObj} from '@storybook/react'

import {JSONSchemaForm} from './JSONSchemaForm'

const meta: Meta<typeof JSONSchemaForm> = {
  component: JSONSchemaForm,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Simple example with email and password fields
export const Simple: Story = {
  render: () => (
    <JSONSchemaForm
      debugMode
      jsonSchema={{
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          pw: {
            type: 'string',
            minLength: 8,
            description: 'Password must be at least 8 characters',
            title: 'Secure Password',
            format: 'password',
          },
        },
      }}
    />
  ),
}

export const WithUISchema: Story = {
  render: () => (
    <JSONSchemaForm
      debugMode
      jsonSchema={{
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
          oauth: {
            type: 'object',
            properties: {
              client_id: {
                type: 'string',
              },
              client_secret: {
                type: 'string',
              },
            },
            // @ts-expect-error
            'ui:field': 'OAuthField',
            'ui:classNames': 'bg-red-50 p-2',
          },
          scopes: {
            type: 'array',
            items: {
              type: 'string',
            },
            // @ts-expect-error
            'ui:widget': 'MultiSelectWidget',
          },
        },
      }}
    />
  ),
}
