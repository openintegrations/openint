import type {Meta, StoryObj} from '@storybook/react'
import {core} from '@openint/api-v1/models'
import {SchemaForm} from '../../components'

export function ApiV1Schema() {
  // Schema form... mostly works
  return <SchemaForm schema={core.event_insert as any} />
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'v0/ApiV1Schema',
  component: ApiV1Schema,
  parameters: {},
} satisfies Meta<typeof ApiV1Schema>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
}
