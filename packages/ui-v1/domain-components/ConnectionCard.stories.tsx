import type {Meta, StoryObj} from '@storybook/react'
import {FIXTURES} from './__stories__/fixtures'
import {ConnectionCard} from './ConnectionCard'

const meta: Meta<typeof ConnectionCard> = {
  title: 'Domain/ConnectionCard',
  component: ConnectionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConnectionCard>

export const Default: Story = {
  args: {
    connection: FIXTURES.connections[0],
  },
}

export const NoLogo: Story = {
  args: {
    connection: FIXTURES.connections[1],
  },
}
