'use client'

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
const data: Person[] = [
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

export default function SimpleDataTableExample() {
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

  // Example of row click handler
  const handleRowClick = (person: Person) => {
    console.log('Clicked on:', person)
    alert(`You clicked on ${person.name}`)
  }

  // Example of custom filter
  const customFilter = (person: Person) => {
    // Only show active users
    // return person.status === 'active'

    // Or show all users (default)
    return true
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">People Directory</h1>

      {/* Basic usage */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Basic Table</h2>
        <SimpleDataTable data={data} columns={columns} />
      </div>

      {/* With row selection */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Table with Row Selection</h2>
        <SimpleDataTable data={data} columns={columns} enableSelect />
      </div>

      {/* With row click handler */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Table with Row Click</h2>
        <SimpleDataTable
          data={data}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Loading state example */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Loading State</h2>
        <SimpleDataTable data={[]} columns={columns} isLoading={true} />
      </div>

      {/* Error state example */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Error State</h2>
        <SimpleDataTable
          data={[]}
          columns={columns}
          error={new Error('Failed to fetch data')}
        />
      </div>
    </div>
  )
}
