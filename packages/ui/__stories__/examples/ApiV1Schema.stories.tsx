import type {Meta, StoryObj} from '@storybook/react'
import {core} from '@openint/api-v1/models'
import {z} from '@openint/util'
import {SchemaForm} from '../../components'

export function ApiV1Schema(props: {schema: any}) {
  // Schema form... mostly works
  return <SchemaForm schema={props.schema} />
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'v0/ApiV1Schema',
  component: ApiV1Schema,
  parameters: {},
} satisfies Meta<typeof ApiV1Schema>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  args: {
    schema: z.object({
      title: z.string(),
      description: z.string(),
    }),
  },
}

export const Event: Story = {
  args: {
    schema: core.event_insert,
  },
}
