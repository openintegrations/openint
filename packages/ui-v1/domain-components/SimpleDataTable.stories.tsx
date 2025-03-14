import type {Meta, StoryObj} from '@storybook/react'
import {SimpleDataTable} from './SimpleDataTable'

// Example data type
interface Person {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

// Sample data
const sampleData: Person[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Designer',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Developer',
    status: 'active',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'Designer',
    status: 'inactive',
  },
]

// Define columns
const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}: {row: {original: Person}}) => (
      <div
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          row.original.status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
        {row.original.status}
      </div>
    ),
  },
]

const meta: Meta<typeof SimpleDataTable> = {
  title: 'UI-V1/SimpleDataTable',
  component: SimpleDataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'The data to display in the table',
      control: 'object',
    },
    columns: {
      description: 'Column definitions for the table',
      control: 'object',
    },
    enableSelect: {
      description: 'Enable row selection',
      control: 'boolean',
    },
    filter: {
      description: 'Custom filter function',
      control: false,
    },
    onRowClick: {
      description: 'Function called when a row is clicked',
      control: false,
      action: 'rowClicked',
    },
    isLoading: {
      description: 'Show loading state',
      control: 'boolean',
    },
    error: {
      description: 'Error to display',
      control: 'object',
    },
  },
}

export default meta
type Story = StoryObj<typeof SimpleDataTable<Person, any>>

// Basic usage
export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
  },
}

// With row selection
export const WithRowSelection: Story = {
  args: {
    data: sampleData,
    columns,
    enableSelect: true,
  },
}

// With row click handler
export const WithRowClick: Story = {
  args: {
    data: sampleData,
    columns,
    onRowClick: (person) => console.log('Clicked on:', person),
  },
}

// Custom filter (only active users)
export const FilteredData: Story = {
  args: {
    data: sampleData,
    columns,
    filter: (person: any) => {
      const typedPerson = person as Person
      return typedPerson.status === 'active'
    },
  },
}

// Loading state
export const Loading: Story = {
  args: {
    data: [],
    columns,
    isLoading: true,
  },
}

// Error state
export const ErrorState: Story = {
  args: {
    data: [],
    columns,
    error: new Error('Failed to fetch data'),
  },
}

// Empty state
export const Empty: Story = {
  args: {
    data: [],
    columns,
  },
}
