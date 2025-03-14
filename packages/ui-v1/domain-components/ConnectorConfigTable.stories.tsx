import type {Meta, StoryObj} from '@storybook/react'
import {DataTable} from '../components/DataTable'
import type {ConnectorConfigTemporary} from './__stories__/fixtures'
import {FIXTURES} from './__stories__/fixtures'
import {CONNECTOR_CONFIG_COLUMNS} from './ConnectorConfigTable'

const meta: Meta<typeof DataTable<ConnectorConfigTemporary, string>> = {
  title: 'UI-V1/ConnectorConfig/Table',
  component: DataTable,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: FIXTURES.connectorConfigList,
    columns: CONNECTOR_CONFIG_COLUMNS,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    columns: CONNECTOR_CONFIG_COLUMNS,
    isRefetching: true,
  },
}

export const NoData: Story = {
  args: {
    data: [],
    columns: CONNECTOR_CONFIG_COLUMNS,
  },
}
