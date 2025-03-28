/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {Meta, StoryObj} from '@storybook/react'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm, ZodSchemaForm} from './SchemaForm'

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
            pw: z.string().min(8).openapi({
              description: 'Password must be at least 8 characters',
              title: 'Secure Password',
              format: 'password',
            }),
          })
          .openapi({ref: 'oauthCredentials'}),
      )}
    />
  ),
}

const zOauth = z
  .object({
    client_id: z.string(),
    client_secret: z.string(),
  })
  .openapi({
    'ui:field': 'OAuthField',
    'ui:classNames': 'bg-red-50 p-2',
  })

export const WithUISchema: Story = {
  render: () => (
    <JSONSchemaForm
      debugMode
      jsonSchema={zodToOas31Schema(
        z.object({
          name: z.string().openapi({title: 'Name'}),
          oauth: zOauth,
          scopes: z.array(z.string()).openapi({
            'ui:widget': 'MultiSelectWidget',
          }),
        }),
      )}
    />
  ),
}

export const Union: Story = {
  args: {
    debugMode: true,
    schema: z.object({
      oauth: z.union([
        z.null().openapi({
          title: 'Use OpenInt platform credentials',
        }),
        zOauth.openapi({
          title: 'Use my own credentials',
          // Would be nice to not have re-specify and have it inherit previous values by defalut of possible
          // Maybe an explicit .openapi(prev => ({...prev, newProp: 'newValue'}))?
          'ui:field': 'OAuthField',
        }),
      ]),
    }),
  },
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
