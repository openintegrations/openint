import type {Meta, StoryObj} from '@storybook/react'
import {ConnectorConfigTableCell} from '../components/ConnectorConfigTableCell'
import {
  ColumnDef,
  DataTable,
  useDataTableContext,
} from '../components/DataTable'
import {
  MultiSelectActionBar,
  useTableRowSelection,
} from '../components/MultiSelectActionBar'
import {
  columns,
  ConnectorConfig,
  ConnectorConfigTable,
} from './ConnectorConfigTable'

// Sample data for the connector config table
const connectorConfigs: ConnectorConfig[] = [
  {
    id: '101',
    name: 'Salesforce',
    enabled: true,
    environment: 'production',
    firstCreated: 'May 12, 2025',
  },
  {
    id: '102',
    name: 'HubSpot',
    enabled: true,
    environment: 'sandbox',
    firstCreated: 'May 10, 2025',
  },
  {
    id: '103',
    name: 'Stripe',
    enabled: false,
    environment: 'production',
    firstCreated: 'May 8, 2025',
  },
  {
    id: '104',
    name: 'Google Drive',
    enabled: true,
    environment: 'sandbox',
    firstCreated: 'May 6, 2025',
  },
  {
    id: '105',
    name: 'Microsoft OneDrive',
    enabled: false,
    environment: 'production',
    firstCreated: 'May 4, 2025',
  },
  {
    id: '106',
    name: 'Shopify',
    enabled: true,
    environment: 'sandbox',
    firstCreated: 'May 2, 2025',
  },
  {
    id: '107',
    name: 'Zendesk',
    enabled: true,
    environment: 'production',
    firstCreated: 'April 30, 2025',
  },
  {
    id: '108',
    name: 'Slack',
    enabled: false,
    environment: 'sandbox',
    firstCreated: 'April 28, 2025',
  },
  {
    id: '109',
    name: 'Amazon S3',
    enabled: true,
    environment: 'production',
    firstCreated: 'April 26, 2025',
  },
]

const meta = {
  title: 'Domain Components/ConnectorConfigTable',
  component: ConnectorConfigTable,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ConnectorConfigTable>

export default meta
type Story = StoryObj<
  typeof DataTable<ConnectorConfig, unknown> | typeof ConnectorConfigTable
>

type StoryArgs = {
  data: ConnectorConfig[]
  columns: ColumnDef<ConnectorConfig, unknown>[]
  enableSelect?: boolean
}

export const Default: Story = {
  args: {
    data: connectorConfigs,
    columns: columns,
  },
  render: (args: StoryArgs) => (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <DataTable {...args}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>
    </div>
  ),
}

// Create a component that displays the MultiSelectActionBar when rows are selected
const SelectionActionsBar = () => {
  const {table} = useDataTableContext()

  // Handle row deletion (would be connected to API in real application)
  const handleDeleteRows = (
    _selectedRows: Record<string, boolean>,
    selectedItems: ConnectorConfig[],
  ) => {
    console.log('Deleting connector configs:', selectedItems)
    alert(
      `Deleting ${selectedItems.length} connector config(s): ${selectedItems
        .map((item) => item.name)
        .join(', ')}`,
    )
  }

  // Use the hook to get selection state and handlers
  const {selectedCount, handleClear, handleDelete} =
    useTableRowSelection<ConnectorConfig>(table, handleDeleteRows)

  return selectedCount > 0 ? (
    <MultiSelectActionBar
      selectedCount={selectedCount}
      onDelete={handleDelete}
      onClear={handleClear}
    />
  ) : null
}

// Add a story that shows selecting rows with MultiSelectActionBar
export const WithRowSelection: Story = {
  args: {
    data: connectorConfigs,
    columns: columns,
    enableSelect: true,
  },
  render: (args: StoryArgs) => (
    <div className="relative overflow-hidden rounded-lg border shadow-sm">
      <DataTable {...args}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
        <SelectionActionsBar />
      </DataTable>
    </div>
  ),
}

// Add a story to demonstrate the difference between compact and regular variants
export const CompactVsRegularVariant: Story = {
  args: {
    data: connectorConfigs.slice(0, 3),
  },
  render: (args: StoryArgs) => {
    // Create custom columns for this story
    const customColumns: Array<ColumnDef<ConnectorConfig, unknown>> = [
      {
        id: 'compact',
        header: 'Compact Variant (Just Logo & ID)',
        cell: ({row}) => {
          return (
            <ConnectorConfigTableCell
              name={row.original.name}
              id={row.original.id}
              compact={true}
              backgroundColor="#f5f5f5"
              textColor="#666666"
            />
          )
        },
      },
      {
        id: 'regular',
        header: 'Regular Variant (With Name)',
        cell: ({row}) => {
          return (
            <ConnectorConfigTableCell
              name={row.original.name}
              id={row.original.id}
              compact={false}
              backgroundColor="#f5f5f5"
              textColor="#666666"
            />
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({row}) => {
          return (
            <div
              className={`text-sm font-medium ${row.original.enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {row.original.enabled ? 'Enabled' : 'Disabled'}
            </div>
          )
        },
      },
    ]

    return (
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <DataTable {...args} columns={customColumns}>
          <DataTable.Header>
            <DataTable.SearchInput />
            <DataTable.ColumnVisibilityToggle />
          </DataTable.Header>
          <DataTable.Table />
          <DataTable.Footer>
            <DataTable.Pagination />
          </DataTable.Footer>
        </DataTable>
      </div>
    )
  },
}
