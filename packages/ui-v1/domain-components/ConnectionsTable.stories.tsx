import type {Meta, StoryObj} from '@storybook/react'
import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {ConnectionTableCell} from '../components/ConnectionTableCell'
import {ConnectorConfigTableCell} from '../components/ConnectorConfigTableCell'
import {CustomerTableCell} from '../components/CustomerTableCell'
import type {ColumnDef} from '../components/DataTable'
import {DataTable, useDataTableContext} from '../components/DataTable'
import {
  MultiSelectActionBar,
  useTableRowSelection,
} from '../components/MultiSelectActionBar'
import {StatusCell} from '../components/StatusCell'
import type {StatusType} from '../components/StatusDot'

// Define the Connection data structure based on the image
interface Connection {
  id: string
  name: string
  status: StatusType
  customerId: string
  customerName: string
  connectorConfigId: string
  connectorConfigName: string
  firstCreated: string
  lastUpdated: string
  metadata: Record<string, any> | null
  // Add required Core connection properties
  customer_id: string
  connector_config_id: string
  integration_id: string | null
  created_at: string
  updated_at: string
  connector_name: string
  settings: Record<string, any>
}

// Sample data for the connections table
const connections: Connection[] = [
  {
    id: '1',
    name: 'AWS S3 Connection',
    status: 'healthy',
    customerId: '101',
    customerName: 'Acme Corporation',
    connectorConfigId: '201',
    connectorConfigName: 'AWS S3 Config',
    firstCreated: 'May 12, 2025',
    lastUpdated: '1m ago',
    metadata: {name: 'AWS S3 Connection'},
    // Add required Core connection properties
    customer_id: '101',
    connector_config_id: '201',
    integration_id: null,
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-05-12T00:00:00Z',
    connector_name: 'AWS S3 Config',
    settings: {},
  },
  {
    id: '2',
    name: 'HubSpot Integration',
    status: 'destructive',
    customerId: '102',
    customerName: 'Globex Industries',
    connectorConfigId: '202',
    connectorConfigName: 'HubSpot CRM Config',
    firstCreated: 'May 12, 2025',
    lastUpdated: '14h ago',
    metadata: {name: 'HubSpot Integration'},
    // Add required Core connection properties
    customer_id: '102',
    connector_config_id: '202',
    integration_id: null,
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-05-12T00:00:00Z',
    connector_name: 'HubSpot CRM Config',
    settings: {},
  },
  {
    id: '3',
    name: 'Salesforce Connection',
    status: 'warning',
    customerId: '103',
    customerName: 'Initech Solutions',
    connectorConfigId: '203',
    connectorConfigName: 'Salesforce Enterprise',
    firstCreated: 'May 12, 2025',
    lastUpdated: '1 week ago',
    metadata: {name: 'Salesforce Connection'},
    // Add required Core connection properties
    customer_id: '103',
    connector_config_id: '203',
    integration_id: null,
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-05-12T00:00:00Z',
    connector_name: 'Salesforce Enterprise',
    settings: {},
  },
  {
    id: '4',
    name: 'Zendesk Support',
    status: 'offline',
    customerId: '104',
    customerName: 'Umbrella Corp Ltd',
    connectorConfigId: '204',
    connectorConfigName: 'Zendesk Enterprise',
    firstCreated: 'May 12, 2025',
    lastUpdated: 'Jun 4, 2025',
    metadata: {name: 'Zendesk Support'},
    // Add required Core connection properties
    customer_id: '104',
    connector_config_id: '204',
    integration_id: null,
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-06-04T00:00:00Z',
    connector_name: 'Zendesk Enterprise',
    settings: {},
  },
  {
    id: '5',
    name: 'Google Drive Storage',
    status: 'offline',
    customerId: '105',
    customerName: 'Wayne Enterprises',
    connectorConfigId: '205',
    connectorConfigName: 'Google Workspace',
    firstCreated: 'May 12, 2025',
    lastUpdated: 'Jun 4, 2025',
    metadata: {name: 'Google Drive Storage'},
    // Add required Core connection properties
    customer_id: '105',
    connector_config_id: '205',
    integration_id: null,
    created_at: '2025-05-12T00:00:00Z',
    updated_at: '2025-06-04T00:00:00Z',
    connector_name: 'Google Workspace',
    settings: {},
  },
]

// These logo getter functions are not used
// const getConnectionLogo = (name: string) => {
//   // Map for specific initials
//   const initialsMap: Record<string, string> = {
//     'AWS S3 Connection': 'AW',
//     'HubSpot Integration': 'HU',
//     'Salesforce Connection': 'SA',
//     'Zendesk Support': 'ZE',
//     'Google Drive Storage': 'GO',
//   }

//   return initialsMap[name] || name.substring(0, 2).toUpperCase()
// }

// // Define a custom renderer for the connector config cell to use the right initials
// const getConfigLogo = (name: string) => {
//   // Map for specific initials
//   const initialsMap: Record<string, string> = {
//     'AWS S3 Config': 'AW',
//     'HubSpot CRM Config': 'HU',
//     'Salesforce Enterprise': 'SA',
//     'Zendesk Enterprise': 'ZE',
//     'Google Workspace': 'GO',
//   }

//   return initialsMap[name] || name.substring(0, 2).toUpperCase()
// }

// // Define a custom renderer for the customer cell to use the right initials
// const getCustomerLogo = (name: string) => {
//   // Map for specific initials
//   const initialsMap: Record<string, string> = {
//     'Acme Corporation': 'A',
//     'Globex Industries': 'G',
//     'Initech Solutions': 'I',
//     'Umbrella Corp Ltd': 'U',
//     'Wayne Enterprises': 'W',
//   }

//   return initialsMap[name] || name.charAt(0).toUpperCase()
// }

// Define the columns for the connections table
const columns: Array<ColumnDef<Connection>> = [
  {
    id: 'connection',
    header: 'Connection',
    cell: ({row}) => {
      // Create a connection object that matches the Core type
      const connection = {
        id: row.original.id,
        customer_id: row.original.customer_id,
        connector_config_id: row.original.connector_config_id,
        integration_id: row.original.integration_id,
        created_at: row.original.created_at,
        updated_at: row.original.updated_at,
        metadata: row.original.metadata,
        connector_name: row.original.connector_name,
        settings: row.original.settings,
      }

      return (
        <ConnectionTableCell
          connection={connection}
          simple={false}
          compact={true}
          useIcon={true}
        />
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({row}) => <StatusCell status={row.original.status} />,
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => (
      <CustomerTableCell
        customer={{
          id: row.original.customerId,
          created_at: row.original.created_at,
          updated_at: row.original.updated_at,
          connection_count: 5,
        }}
        simple={false}
        compact={true}
        useIcon={true}
      />
    ),
  },
  {
    id: 'connectorConfig',
    header: 'Connector Config',
    cell: ({row}) => {
      return (
        <ConnectorConfigTableCell
          connectorConfig={{
            id: row.original.connectorConfigId,
            display_name: row.original.connectorConfigName,
            connector_name: row.original.connectorConfigName,
            created_at: row.original.created_at,
            updated_at: row.original.updated_at,
            disabled: false,
            org_id: 'org-123',
          }}
          status={row.original.status}
          simple={false}
          compact={true}
        />
      )
    },
  },
  {
    id: 'firstCreated',
    header: 'First Created',
    accessorKey: 'firstCreated',
    cell: ({row}) => (
      <div className="text-gray-500">{row.original.firstCreated}</div>
    ),
  },
  {
    id: 'lastUpdated',
    header: 'Last Updated',
    accessorKey: 'lastUpdated',
    cell: ({row}) => (
      <div className="text-gray-500">{row.original.lastUpdated}</div>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    cell: () => (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
]

// Define compact cell columns for the connections table
const compactColumns: Array<ColumnDef<Connection>> = [
  {
    id: 'connection',
    header: 'Connection',
    cell: ({row}) => {
      // Create a connection object that matches the Core type
      const connection = {
        id: row.original.id,
        customer_id: row.original.customer_id,
        connector_config_id: row.original.connector_config_id,
        integration_id: row.original.integration_id,
        created_at: row.original.created_at,
        updated_at: row.original.updated_at,
        metadata: row.original.metadata,
        connector_name: row.original.connector_name,
        settings: row.original.settings,
      }

      return (
        <ConnectionTableCell
          connection={connection}
          simple={false}
          compact={true}
          useIcon={true}
        />
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({row}) => <StatusCell status={row.original.status} />,
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => (
      <CustomerTableCell
        customer={{
          id: row.original.customerId,
          created_at: row.original.created_at,
          updated_at: row.original.updated_at,
          connection_count: 5,
        }}
        simple={false}
        compact={true}
        useIcon={true}
      />
    ),
  },
  {
    id: 'connectorConfig',
    header: 'Connector Config',
    cell: ({row}) => {
      return (
        <ConnectorConfigTableCell
          connectorConfig={{
            id: row.original.connectorConfigId,
            display_name: row.original.connectorConfigName,
            connector_name: row.original.connectorConfigName,
            created_at: row.original.created_at,
            updated_at: row.original.updated_at,
            disabled: false,
            org_id: 'org-123',
          }}
          status={row.original.status}
          simple={false}
          compact={true}
        />
      )
    },
  },
  {
    id: 'firstCreated',
    header: 'First Created',
    accessorKey: 'firstCreated',
    cell: ({row}) => (
      <div className="text-gray-500">{row.original.firstCreated}</div>
    ),
  },
  {
    id: 'lastUpdated',
    header: 'Last Updated',
    accessorKey: 'lastUpdated',
    cell: ({row}) => (
      <div className="text-gray-500">{row.original.lastUpdated}</div>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    cell: () => (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
]

const meta: Meta<typeof DataTable> = {
  title: 'DOMAIN COMPONENTS/ConnectionsTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DataTable<Connection, unknown>>

export const Default: Story = {
  args: {
    data: connections,
    columns,
  },
  render: (args) => (
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
    selectedItems: Connection[],
  ) => {
    console.log('Deleting connections:', selectedItems)
    alert(
      `Deleting ${selectedItems.length} connection(s): ${selectedItems.map((item) => item.name).join(', ')}`,
    )
  }

  // Use the hook to get selection state and handlers
  const {selectedCount, handleClear, handleDelete} =
    useTableRowSelection<Connection>(table, handleDeleteRows)

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
    data: connections,
    columns,
    enableSelect: true,
  },
  render: (args) => (
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

// Add a story that shows compact cells
export const WithCompactCells: Story = {
  args: {
    data: connections,
    columns: compactColumns,
  },
  render: (args) => (
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
    data: connections,
    columns: compactColumns,
    enableSelect: true,
  },
  render: (args) => (
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
