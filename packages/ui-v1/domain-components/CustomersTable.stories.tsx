import type {Meta, StoryObj} from '@storybook/react'
import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {CustomerTableCell} from '../components/CustomerTableCell'
import {
  ColumnDef,
  DataTable,
  useDataTableContext,
} from '../components/DataTable'
import {Icon} from '../components/Icon'
import {
  MultiSelectActionBar,
  useTableRowSelection,
} from '../components/MultiSelectActionBar'
import {columns, Customer} from './CustomersTable'

// Sample data for the customers table based on the image
const customers: Customer[] = [
  {
    id: '101',
    name: 'Acme Corporation',
    connectionsCount: 472,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '102',
    name: 'Globex Industries',
    connectionsCount: 238,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '103',
    name: 'Initech Solutions',
    connectionsCount: 184,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '104',
    name: 'Umbrella Corp Ltd',
    connectionsCount: 95,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '105',
    name: 'Wayne Enterprises',
    connectionsCount: 312,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '106',
    name: 'Stark Industries',
    connectionsCount: 156,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '107',
    name: 'Cyberdyne Systems',
    connectionsCount: 67,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '108',
    name: 'Soylent Corp',
    connectionsCount: 43,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '109',
    name: 'Oceanic Airlines',
    connectionsCount: 128,
    firstCreated: 'May 12, 2025',
  },
]

const meta: Meta<typeof DataTable> = {
  title: 'Domain Components/CustomersTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DataTable<Customer, unknown>>

export const Default: Story = {
  args: {
    data: customers,
    columns: columns,
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
    selectedItems: Customer[],
  ) => {
    console.log('Deleting customers:', selectedItems)
    alert(
      `Deleting ${selectedItems.length} customer(s): ${selectedItems.map((item) => item.name).join(', ')}`,
    )
  }

  // Use the hook to get selection state and handlers
  const {selectedCount, handleClear, handleDelete} =
    useTableRowSelection<Customer>(table, handleDeleteRows)

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
    data: customers,
    columns: columns,
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

// Add a story that demonstrates clicking on connections
export const WithConnectionsAction: Story = {
  args: {
    data: customers,
  },
  render: (args) => {
    // Create custom columns for this story
    const customColumns: Array<ColumnDef<Customer, unknown>> = [
      {
        id: 'customer',
        header: 'Customer',
        cell: ({row}) => {
          return (
            <CustomerTableCell
              customer={{
                id: row.original.id,
                created_at: row.original.firstCreated,
                updated_at: row.original.firstCreated,
                connection_count: row.original.connectionsCount,
              }}
              simple={false}
              compact={true}
              useIcon={true}
            />
          )
        },
      },
      {
        id: 'connections',
        header: 'Connections',
        cell: ({row}) => {
          const connectionsCount = row.original.connectionsCount

          return (
            <button
              className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-700"
              onClick={(e) => {
                e.stopPropagation()
                alert(
                  `Showing ${connectionsCount} connections for ${row.original.name}`,
                )
              }}>
              <Icon
                name="Network"
                className="text-purple-600 group-hover:text-purple-700"
                size={16}
              />
              <span className="font-medium group-hover:underline">
                {connectionsCount}
              </span>
            </button>
          )
        },
      },
      {
        id: 'firstCreated',
        header: 'First Created',
        accessorKey: 'firstCreated',
        cell: ({row}) => {
          return (
            <div className="text-gray-500">{row.original.firstCreated}</div>
          )
        },
      },
      {
        id: 'action',
        header: '',
        cell: () => {
          return (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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

// Define compact cell columns for the customers table
const compactColumns: Array<ColumnDef<Customer, unknown>> = [
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => {
      return (
        <CustomerTableCell
          customer={{
            id: row.original.id,
            created_at: row.original.firstCreated,
            updated_at: row.original.firstCreated,
            connection_count: row.original.connectionsCount,
          }}
          simple={false}
          compact={true}
          useIcon={true}
        />
      )
    },
  },
  {
    id: 'connections',
    header: 'Connections',
    cell: ({row}) => {
      const connectionsCount = row.original.connectionsCount

      return (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Icon name="Network" className="text-purple-600" size={16} />
          <span className="font-medium">{connectionsCount}</span>
        </div>
      )
    },
  },
  {
    id: 'firstCreated',
    header: 'First Created',
    accessorKey: 'firstCreated',
    cell: ({row}) => {
      return <div className="text-gray-500">{row.original.firstCreated}</div>
    },
  },
  {
    id: 'action',
    header: '',
    cell: () => {
      return (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    },
  },
]

// Add a story that shows compact cells
export const WithCompactCells: Story = {
  args: {
    data: customers,
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
    data: customers,
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
