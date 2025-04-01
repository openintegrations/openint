import type {Meta, StoryObj} from '@storybook/react'
import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {BaseTableCell} from '../components/BaseTableCell'
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
import {StatusDot} from '../components/StatusDot'
import {ConnectionsCardView} from './ConnectionsCardView'

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
  metadata?: Record<string, any> // Add metadata field for compatibility
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
  },
]

// Define a custom renderer for the connector cell to use the right initials
const getConnectionLogo = (name: string) => {
  // Map for specific initials
  const initialsMap: Record<string, string> = {
    'AWS S3 Connection': 'AW',
    'HubSpot Integration': 'HU',
    'Salesforce Connection': 'SA',
    'Zendesk Support': 'ZE',
    'Google Drive Storage': 'GO',
  }

  return initialsMap[name] || name.substring(0, 2).toUpperCase()
}

// Define a custom renderer for the connector config cell to use the right initials
const getConfigLogo = (name: string) => {
  // Map for specific initials
  const initialsMap: Record<string, string> = {
    'AWS S3 Config': 'AW',
    'HubSpot CRM Config': 'HU',
    'Salesforce Enterprise': 'SA',
    'Zendesk Enterprise': 'ZE',
    'Google Workspace': 'GO',
  }

  return initialsMap[name] || name.substring(0, 2).toUpperCase()
}

// Define a custom renderer for the customer cell to use the right initials
const getCustomerLogo = (name: string) => {
  // Map for specific initials
  const initialsMap: Record<string, string> = {
    'Acme Corporation': 'A',
    'Globex Industries': 'G',
    'Initech Solutions': 'I',
    'Umbrella Corp Ltd': 'U',
    'Wayne Enterprises': 'W',
  }

  return initialsMap[name] || name.charAt(0).toUpperCase()
}

// Define a custom logo renderer for ConnectionTableCell
// @ts-ignore
const CustomConnectionTableCell = ({
  name,
  id,
  status,
  backgroundColor,
  textColor,
}: {
  name: string
  id: string
  status: StatusType
  backgroundColor: string
  textColor: string
}) => {
  // This is a wrapper component that overrides the default initials
  const logo = (
    <div
      className="relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded"
      style={{backgroundColor}}>
      <span className="text-base font-medium" style={{color: textColor}}>
        {getConnectionLogo(name)}
      </span>
      {status && (
        <div className="absolute right-1 top-1">
          <StatusDot status={status} />
        </div>
      )}
    </div>
  )

  return (
    <BaseTableCell
      name={name}
      logo={logo}
      id={id ? `CONNID_${id}` : undefined}
      status={status}
    />
  )
}

// Define a custom logo renderer for CustomerTableCell
const CustomCustomerTableCell = ({
  name,
  id,
  status,
  backgroundColor,
  textColor,
}: {
  name: string
  id: string
  status: StatusType
  backgroundColor: string
  textColor: string
}) => {
  // This is a wrapper component that overrides the default initials
  const logo = (
    <div
      className="relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded"
      style={{backgroundColor}}>
      <span className="text-base font-semibold" style={{color: textColor}}>
        {getCustomerLogo(name)}
      </span>
      {status && (
        <div className="absolute right-1 top-1">
          <StatusDot status={status} />
        </div>
      )}
    </div>
  )

  return (
    <BaseTableCell
      name={name}
      logo={logo}
      id={id ? `CUSID_${id}` : undefined}
      status={status}
    />
  )
}

// Define a custom logo renderer for ConnectorConfigTableCell
const CustomConnectorConfigTableCell = ({
  name,
  id,
  status,
  backgroundColor,
  textColor,
}: {
  name: string
  id: string
  status: StatusType
  backgroundColor: string
  textColor: string
}) => {
  // This is a wrapper component that overrides the default initials
  const logo = (
    <div
      className="relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded"
      style={{backgroundColor}}>
      <span className="text-base font-semibold" style={{color: textColor}}>
        {getConfigLogo(name)}
      </span>
      {status && (
        <div className="absolute right-1 top-1">
          <StatusDot status={status} />
        </div>
      )}
    </div>
  )

  return (
    <BaseTableCell
      name={name}
      logo={logo}
      id={id ? `CCFGID_${id}` : undefined}
      status={status}
    />
  )
}

// Define the columns for the connections table
const columns: Array<ColumnDef<Connection>> = [
  {
    id: 'connection',
    header: 'Connection',
    cell: ({row}) => {
      return (
        <ConnectionTableCell
          connection={row.original}
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
          // No name property in the Core customer type
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
      return (
        <ConnectionTableCell
          connection={row.original}
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
          // No name property in the Core customer type
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
