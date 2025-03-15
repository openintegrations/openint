import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {z} from '@openint/util'
import {zodToOas31Schema} from '../../../../kits/vdk'
import {JSONSchemaForm, ZodSchemaForm} from '../SchemaForm'

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
        z.object({
          email: z.string().email(),
          password: z.string().min(8).openapi({
            description: 'Password must be at least 8 characters',
            title: 'Secure Password',
          }),
        }),
      )}
    />
  ),
}

// Simple example with email and password fields
export const StaticSchemaForm: Story = {
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
