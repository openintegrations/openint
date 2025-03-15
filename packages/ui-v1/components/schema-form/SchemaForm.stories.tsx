/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {Meta, StoryObj} from '@storybook/react'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {JSONSchemaForm, ZodSchemaForm} from './SchemaForm'
import {zodToOas31Schema} from './utils'

const meta: Meta<typeof ZodSchemaForm> = {
  title: 'ui-v1/components/SchemaForm',
  component: ZodSchemaForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Simple example with email and password fields
export const JsonSchema: Story = {
  render: () => (
    <JSONSchemaForm
      debugMode
      jsonSchema={zodToOas31Schema(
        z
          .object({
            email: z.string().email(),
            password: z.string().min(8).openapi({
              description: 'Password must be at least 8 characters',
              title: 'Secure Password',
            }),
          })
          .openapi({ref: 'oauthCredentials'}),
      )}
    />
  ),
}

export const CustomField: Story = {
  render: () => (
    <JSONSchemaForm
      debugMode
      jsonSchema={zodToOas31Schema(
        z.object({
          oauth: z.object({
            client_id: z.string(),
            client_secret: z.string().openapi({
              ref: 'secret',
            }),
          }),
          scopes: z.array(z.string()),
        }),
      )}
    />
  ),
}

// Simple example with email and password fields
export const ZodSchema: Story = {
  args: {
    schema: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    onSubmit: (data) => {
      console.log('Sample Schema Form submitted:', data)
      alert(
        'Sample Schema Form submitted! Data: ' +
          JSON.stringify(data) +
          ' Check console for details.',
      )
    },
  },
}

// Salesforce connector configuration example using actual schema
export const SalesforceConnectorConfig: Story = {
  args: {
    schema: defConnectors.salesforce.schemas.connectorConfig,
    onSubmit: (data) => {
      console.log('Salesforce Connector Config submitted:', data)
      alert('Salesforce Connector Config submitted! Check console for details.')
    },
  },
}

// Plaid connector configuration example using actual schema
export const PlaidConnectorConfig: Story = {
  args: {
    schema: defConnectors.plaid.schemas.connectorConfig,
    onSubmit: (data) => {
      console.log('Plaid Connector Config submitted:', data)
      alert('Plaid Connector Config submitted! Check console for details.')
    },
  },
}
