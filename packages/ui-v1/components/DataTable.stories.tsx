import type {Meta, StoryObj} from '@storybook/react'
import type {Core} from '@openint/api-v1/models'
import type {
  ColumnDef,
  Columns,
  DataTableProps,
  PaginatedData,
} from './DataTable'

import {useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {FIXTURES} from '../domain-components/__stories__/fixtures'
import {ConnectorTableCell} from '../domain-components/tables/ConnectorTableCell'
import {DataTable} from './DataTable'

const meta: Meta<typeof DataTable> = {
  component: DataTable,
}

export default meta
type Story = StoryObj<typeof DataTable>

type Person = {
  id: number
  name: string
  email: string
  role: string
  age: number
}

// prettier-ignore
const sampleData = [
  {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', age: 32},
  {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', age: 28},
  {id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', age: 45},
  {id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', age: 36},
  {id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', age: 41},
] satisfies Person[]

const sampleColumns = [
  {id: 'name', header: 'Name', accessorKey: 'name'},
  {id: 'email', header: 'Email', accessorKey: 'email'},
  {id: 'role', header: 'Role', accessorKey: 'role'},
  {id: 'age', header: 'Age', accessorKey: 'age'},
] satisfies Columns<Person, string | number>

export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    isRefetching: true,
  },
}

export const NoData: Story = {
  args: {
    data: [],
    columns: sampleColumns,
    children: (
      <>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
          <Button className="ml-4">Call to action</Button>,
        </DataTable.Header>

        <DataTable.Table />

        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </>
    ),
  },
}

export const WithCallToAction: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
    // extraTableControls: <Button className="ml-4">Call to action</Button>,
    enableSelect: true,
    // children: <DataTable.SearchInput />,
  },
  render: (props) => (
    <DataTable {...props}>
      <DataTable.Header>
        <DataTable.SearchInput />
        <DataTable.ColumnVisibilityToggle />
        <Button className="ml-4">Call to action</Button>,
      </DataTable.Header>

      <DataTable.Table />

      <DataTable.Footer>
        <DataTable.Pagination />
      </DataTable.Footer>
    </DataTable>
  ),
}

// Create a separate component for the connector table to avoid TypeScript errors
const ConnectorConfigTableExample = () => {
  // Use the connectorsList from fixtures
  const connectorData = FIXTURES.connectorsList

  // Define columns for connector data
  const connectorColumns: Array<
    ColumnDef<Core['connector'], string | number | string[]>
  > = [
    {
      id: 'connector',
      header: 'Connector',
      accessorKey: 'display_name',
      cell: ({row}) => {
        const connector = row.original
        // Show the complete ConnectorTableCell with all badges in this column only
        return <ConnectorTableCell connector={connector} />
      },
    },
    {
      id: 'connections',
      header: 'Connections',
      cell: () => {
        // Random number for demo purposes
        const count = Math.floor(Math.random() * 100)
        return count
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => {
        // Empty placeholder
        return <span className="text-gray-400">--</span>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => {
        // Empty placeholder
        return (
          <Button variant="ghost" size="sm">
            View
          </Button>
        )
      },
    },
  ]

  return (
    <DataTable<Core['connector'], string | number | string[]>
      data={connectorData}
      columns={connectorColumns}>
      <DataTable.Header>
        <DataTable.SearchInput />
        <DataTable.ColumnVisibilityToggle />
        <Button className="ml-4">Add Connector</Button>
      </DataTable.Header>
      <DataTable.Table />
      <DataTable.Footer>
        <DataTable.Pagination />
      </DataTable.Footer>
    </DataTable>
  )
}

// Add a new story variant for connectors
export const ConnectorConfigTable: Story = {
  render: () => <ConnectorConfigTableExample />,
}

const roles = ['Admin', 'User', 'Editor', 'Viewer']
const names = [
  'John',
  'Jane',
  'Bob',
  'Alice',
  'Charlie',
  'David',
  'Eve',
  'Frank',
  'George',
  'Helen',
]
const lastNames = [
  'Doe',
  'Smith',
  'Johnson',
  'Brown',
  'Wilson',
  'Taylor',
  'Moore',
  'Martin',
  'Lee',
  'Garcia',
]

const generateRandomData = (count: number): Person[] => {
  return Array.from({length: count}, (_, i) => {
    const name = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`
    return {
      id: i + 1,
      name,
      email,
      role: roles[Math.floor(Math.random() * roles.length)] as string,
      age: Math.floor(Math.random() * 50) + 20,
    }
  })
}

const PaginatedTable = (props: DataTableProps<Person, string | number>) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentData, setCurrentData] = useState(generateRandomData(10))

  const handlePageChange = async (newPageIndex: number) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setPageIndex(newPageIndex)
    setCurrentData(generateRandomData(10))
    setIsLoading(false)
  }

  return (
    <DataTable
      {...props}
      data={{
        ...props.data,
        items: currentData,
        offset: pageIndex * (props.data as PaginatedData<Person>).limit,
      }}
      isLoading={isLoading}
      onPageChange={handlePageChange}
    />
  )
}

export const WithPagination: Story = {
  args: {
    data: {
      items: generateRandomData(10),
      total: 100,
      limit: 10,
      offset: 0,
    } as PaginatedData<Person>,
    columns: sampleColumns,
    children: (
      <>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </>
    ),
  },
  render: (props) => (
    <PaginatedTable
      {...(props as unknown as DataTableProps<Person, string | number>)}
    />
  ),
}
