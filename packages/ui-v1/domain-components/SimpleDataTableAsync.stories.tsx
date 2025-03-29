import type {Meta, StoryObj} from '@storybook/react'
import {useEffect, useState} from 'react'
import {SimpleDataTable} from './SimpleDataTable'

// Example data type
interface User {
  id: number
  name: string
  username: string
  email: string
  company: {
    name: string
  }
}

// Wrapper component to demonstrate async data fetching
const AsyncDataTableDemo = () => {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Fetch data from JSONPlaceholder API
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/users',
        )
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const users = await response.json()
        setData(users)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred'),
        )
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Define columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'company.name',
      header: 'Company',
      cell: ({row}: {row: {original: User}}) => (
        <span className="font-medium">{row.original.company.name}</span>
      ),
    },
  ]

  const handleRowClick = (user: User) => {
    alert(`Selected user: ${user.name} (${user.email})`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users from JSONPlaceholder API</h2>
      <p className="text-gray-500">
        This example demonstrates loading data asynchronously from an API.
      </p>
      <SimpleDataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRowClick={handleRowClick}
        enableSelect
      />
    </div>
  )
}

const meta: Meta = {
  title: 'DOMAIN COMPONENTS/SimpleDataTableAsync',
  component: AsyncDataTableDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Example of using SimpleDataTable with asynchronous data fetching',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AsyncExample: Story = {}
