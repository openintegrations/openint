/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {Meta, StoryObj} from '@storybook/react'
import {z} from '@openint/util/zod-utils'
import {ZodSchemaForm} from './ZodSchemaForm'

const meta: Meta<typeof ZodSchemaForm> = {
  component: ZodSchemaForm,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Simple example with email and password fields
export const Simple: Story = {
  args: {
    schema: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    onSubmit: (data: {formData: Record<string, unknown>}) => {
      console.log('Sample Schema Form submitted:', data)
      alert(
        'Sample Schema Form submitted! Data: ' +
          JSON.stringify(data) +
          ' Check console for details.',
      )
    },
  },
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

// // Salesforce connector configuration example using actual schema
// export const SalesforceConnectorConfig: Story = {
//   args: {
//     schema: defConnectors.salesforce.schemas.connectorConfig,
//     onSubmit: (data) => {
//       console.log('Salesforce Connector Config submitted:', data)
//       alert('Salesforce Connector Config submitted! Check console for details.')
//     },
//   },
// }

// // Plaid connector configuration example using actual schema
// export const PlaidConnectorConfig: Story = {
//   args: {
//     schema: defConnectors.plaid.schemas.connectorConfig,
//     onSubmit: (data) => {
//       console.log('Plaid Connector Config submitted:', data)
//       alert('Plaid Connector Config submitted! Check console for details.')
//     },
//   },
// }
