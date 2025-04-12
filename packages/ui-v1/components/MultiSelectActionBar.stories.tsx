import type {Meta, StoryObj} from '@storybook/react'

import {useState} from 'react'
import {MultiSelectActionBar} from './MultiSelectActionBar'

const meta: Meta<typeof MultiSelectActionBar> = {
  component: MultiSelectActionBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MultiSelectActionBar>

// Basic standalone examples
export const Default: Story = {
  args: {
    selectedCount: 1,
    onDelete: () => {
      alert('Delete clicked')
    },
    onClear: () => {
      alert('Clear selection clicked')
    },
  },
}

export const MultipleSelected: Story = {
  args: {
    selectedCount: 5,
    onDelete: () => {
      alert('Delete clicked')
    },
    onClear: () => {
      alert('Clear selection clicked')
    },
  },
}

// Sample data for the table
const sampleData = [
  {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
  {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User'},
  {id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User'},
  {id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor'},
  {id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User'},
]

// Create a component that demonstrates the MultiSelectActionBar with DataTable
const WithDataTableExample = () => {
  // For demo purposes only, track selection state manually
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({})

  // Calculate number of selected items
  const selectedCount = Object.values(selectedRows).filter(Boolean).length

  // Handle row selection (manually for demo purposes)
  const handleRowSelect = (id: number, selected: boolean) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: selected,
    }))
  }

  // Handle delete action
  const handleDelete = () => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, selected]) => selected)
      .map(([id]) => id)

    alert(`Deleting rows: ${selectedIds.join(', ')}`)
    setSelectedRows({})
  }

  // Handle clear selection
  const handleClear = () => {
    setSelectedRows({})
  }

  return (
    <div className="w-full max-w-4xl">
      <h2 className="mb-4 text-lg font-semibold">People Table</h2>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-2 text-left">Select</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((person) => (
              <tr key={person.id} className="border-b">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={!!selectedRows[person.id]}
                    onChange={(e) =>
                      handleRowSelect(person.id, e.target.checked)
                    }
                  />
                </td>
                <td className="p-2">{person.name}</td>
                <td className="p-2">{person.email}</td>
                <td className="p-2">{person.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-muted-foreground mt-4 text-sm">
        * This is a simplified table for demonstration purposes.
      </div>

      <MultiSelectActionBar
        selectedCount={selectedCount}
        onDelete={handleDelete}
        onClear={handleClear}
      />
    </div>
  )
}

export const WithDataTable: Story = {
  render: () => <WithDataTableExample />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
}
