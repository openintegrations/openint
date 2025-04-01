import type {Meta, StoryObj} from '@storybook/react'
import {Core} from '@openint/api-v1/models'
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
import {columns, ConnectorConfigTable} from './ConnectorConfigTable'

// Sample data for the connector config table
const connectorConfigs: Core['connector_config'][] = [
  {
    id: '101',
    display_name: 'Salesforce',
    connector_name: 'salesforce',
    disabled: false,
    config: {
      environment: 'production',
    },
    created_at: '2025-05-12T12:00:00Z',
    updated_at: '2025-05-12T12:00:00Z',
    org_id: 'org-123',
  },
  {
    id: '102',
    display_name: 'HubSpot',
    connector_name: 'hubspot',
    disabled: false,
    config: {
      environment: 'sandbox',
    },
    created_at: '2025-05-10T12:00:00Z',
    updated_at: '2025-05-10T12:00:00Z',
    org_id: 'org-123',
  },
  {
    id: '103',
    display_name: 'Stripe',
    connector_name: 'stripe',
    disabled: true,
    config: {
      environment: 'production',
    },
    created_at: '2025-05-08T12:00:00Z',
    updated_at: '2025-05-08T12:00:00Z',
    org_id: 'org-123',
  },
  {
    id: '104',
    display_name: 'Google Drive',
    connector_name: 'google-drive',
    disabled: false,
    config: {
      environment: 'sandbox',
    },
    created_at: '2025-05-06T12:00:00Z',
    updated_at: '2025-05-06T12:00:00Z',
    org_id: 'org-123',
  },
  {
    id: '105',
    display_name: 'Microsoft OneDrive',
    connector_name: 'onedrive',
    disabled: true,
    config: {
      environment: 'production',
    },
    created_at: '2025-05-04T12:00:00Z',
    updated_at: '2025-05-04T12:00:00Z',
    org_id: 'org-123',
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
  | typeof DataTable<Core['connector_config'], unknown>
  | typeof ConnectorConfigTable
>

type StoryArgs = {
  data: Core['connector_config'][]
  columns: ColumnDef<Core['connector_config'], unknown>[]
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
    selectedItems: Core['connector_config'][],
  ) => {
    console.log('Deleting connector configs:', selectedItems)
    alert(
      `Deleting ${selectedItems.length} connector config(s): ${selectedItems
        .map((item) => item.display_name || item.connector_name)
        .join(', ')}`,
    )
  }

  // Use the hook to get selection state and handlers
  const {selectedCount, handleClear, handleDelete} = useTableRowSelection<
    Core['connector_config']
  >(table, handleDeleteRows)

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

// Define compact cell columns for the connector config table
const compactColumns: Array<ColumnDef<Core['connector_config'], unknown>> = [
  {
    id: 'connectorConfig',
    header: 'Connector Config',
    cell: ({row}) => {
      return (
        <ConnectorConfigTableCell
          connectorConfig={row.original}
          compact={true}
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
          className={`text-sm font-medium ${row.original.disabled ? 'text-gray-500' : 'text-green-600'}`}>
          {row.original.disabled ? 'Disabled' : 'Enabled'}
        </div>
      )
    },
  },
  {
    id: 'environment',
    header: 'Environment',
    cell: ({row}) => {
      return (
        <div className="text-sm text-gray-500">
          {row.original.config?.environment || 'N/A'}
        </div>
      )
    },
  },
  {
    id: 'created_at',
    header: 'Created At',
    cell: ({row}) => {
      const date = new Date(row.original.created_at)
      return (
        <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>
      )
    },
  },
  {
    id: 'updated_at',
    header: 'Updated At',
    cell: ({row}) => {
      const date = new Date(row.original.updated_at)
      return (
        <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>
      )
    },
  },
]

// Add a story that shows compact cells
export const WithCompactCells: Story = {
  args: {
    data: connectorConfigs,
    columns: compactColumns,
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

// Add a story that shows compact cells with row selection
export const WithCompactCellsAndRowSelection: Story = {
  args: {
    data: connectorConfigs,
    columns: compactColumns,
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
