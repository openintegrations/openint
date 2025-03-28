import type {Meta, StoryObj} from '@storybook/react'
import {DataTable} from '../components/DataTable'
import type {
  ConnectorConfigTemporary,
  ConnectorTemporary,
} from './__stories__/fixtures'
import {FIXTURES} from './__stories__/fixtures'
import {CONNECTOR_CONFIG_COLUMNS} from './ConnectorConfigTable'
import {ConnectorTableCell} from './ConnectorTableCell'

// Debug component to see what's in the data
const DebugData = ({data}: {data: any}) => {
  return <div style={{display: 'none'}}>{JSON.stringify(data)}</div>
}

// Wrapper component to add debugging
const TableWithDebug = (props: any) => {
  console.log('DataTable props:', props)
  return (
    <>
      <DebugData data={props.data} />
      <DataTable {...props} />
    </>
  )
}

// Wrapper component to show a preview of ConnectorTableCell
const ConnectorTableCellPreview = () => {
  // Use the first connector from the fixtures with a type assertion
  const connector = FIXTURES.connectorsList[0] as ConnectorTemporary

  // Make sure we have a valid connector
  if (!connector) {
    return <div>No connector data available</div>
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-4 text-sm font-medium">ConnectorTableCell Preview</h3>
      <div className="flex flex-col gap-4">
        <div className="border-b pb-2">
          <p className="mb-2 text-xs text-gray-500">Default:</p>
          <ConnectorTableCell connector={connector} />
        </div>
        <div className="border-b pb-2">
          <p className="mb-2 text-xs text-gray-500">Without stage badge:</p>
          <ConnectorTableCell connector={connector} showStage={false} />
        </div>
        <div className="border-b pb-2">
          <p className="mb-2 text-xs text-gray-500">Without platform badges:</p>
          <ConnectorTableCell connector={connector} showPlatforms={false} />
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-500">Without any badges:</p>
          <ConnectorTableCell
            connector={connector}
            showStage={false}
            showPlatforms={false}
          />
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof DataTable<ConnectorConfigTemporary, string>> = {
  title: 'UI-V1/ConnectorConfig/Table',
  component: TableWithDebug,
}

export default meta

type Story = StoryObj<typeof meta>

// Create sample data with all required properties
const sampleData: ConnectorConfigTemporary[] = FIXTURES.connectorsList.map(
  (connector, index) => ({
    id: `ccfg_${connector.name}_${index}`,
    connector: {
      ...connector,
      // Ensure these properties exist
      name: connector.name,
      display_name: connector.display_name || connector.name,
      logo_url: connector.logo_url || '',
      stage: connector.stage || 'ga',
      platforms: connector.platforms || [],
    },
    connection_count: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: connector.name,
    display_name: null,
    disabled: null,
  }),
)

// Log the sample data for debugging
console.log('Sample data for table:', sampleData)

export const Default: Story = {
  args: {
    data: sampleData,
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

// Add a dedicated story for ConnectorTableCell
export const TableCellPreview: Story = {
  render: () => <ConnectorTableCellPreview />,
}
