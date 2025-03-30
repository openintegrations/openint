import type {Meta, StoryObj} from '@storybook/react'
import {FIXTURES} from './__stories__/fixtures'
import {ConnectorConfigCard} from './ConnectorConfigCard'

const meta: Meta<typeof ConnectorConfigCard> = {
  title: 'Domain/ConnectorConfigCard',
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
    connectorConfig: FIXTURES.connectorConfigs['salesforce'],
  },
}

export const WithOnPress: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['salesforce'],
    onPress: () => {
      alert('Card pressed!')
    },
  },
}

export const DisplayNameRight: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['salesforce'],
    displayNameLocation: 'right',
  },
}

export const WithChildren: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['salesforce'],
    children: (
      <div className="text-xs text-muted-foreground">
        5 connections
      </div>
    ),
  },
}

export const DisplayNameRightWithChildren: Story = {
  args: {
    connectorConfig: FIXTURES.connectorConfigs['salesforce'],
    displayNameLocation: 'right',
    children: (
      <div className="text-xs text-muted-foreground">
        5 connections
      </div>
    ),
  },
}
