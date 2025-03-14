import type {Meta, StoryObj} from '@storybook/react'
import {DataTable} from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'UI-V1/Components/DataTable',
  component: DataTable,
}

export default meta
type Story = StoryObj<typeof DataTable>

const sampleData = [
  {id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin'},
  {id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User'},
  {id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User'},
  {id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor'},
  {id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User'},
]

const sampleColumns = [
  {id: 'name', header: 'Name', accessorKey: 'name'},
  {id: 'email', header: 'Email', accessorKey: 'email'},
  {id: 'role', header: 'Role', accessorKey: 'role'},
]

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
  },
}
