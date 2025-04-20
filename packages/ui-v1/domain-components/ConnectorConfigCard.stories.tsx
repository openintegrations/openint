import type {Meta, StoryObj} from '@storybook/react'

import {Button} from '@openint/shadcn/ui'
import {FIXTURES} from './__stories__/fixtures'
import {ConnectorConfigCard} from './ConnectorConfigCard'

const meta: Meta<typeof ConnectorConfigCard> = {
  component: ConnectorConfigCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConnectorConfigCard>

export const Default: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['google-drive'],
  },
}

export const WithOnPress: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['google-drive'],
    onPress: () => {
      alert('Card pressed!')
    },
  },
}

export const DisplayNameRight: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['google-drive'],
    displayNameLocation: 'right',
  },
}

export const WithChildren: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['google-drive'],
    children: (
      <div className="text-muted-foreground text-xs">5 connections</div>
    ),
  },
}

export const DisplayNameRightWithChildren: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['google-drive'],
    displayNameLocation: 'right',
    children: <Button variant="default">Connect</Button>,
  },
}
