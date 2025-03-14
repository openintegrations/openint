import type {Meta, StoryObj} from '@storybook/react'
import {Button} from '@openint/shadcn/ui'
import {ColumnDef, Columns, DataTable} from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'UI-V1/Components/DataTable',
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
      <div className="w-full">
        <div className="flex items-center py-4">
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
          <Button className="ml-4">Call to action</Button>,
        </div>
        <div className="rounded-md border">
          <DataTable.Content />
        </div>
        <DataTable.FooterControl showRowCount />
      </div>
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
      <div className="w-full">
        <div className="flex items-center py-4">
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
          <Button className="ml-4">Call to action</Button>,
        </div>
        <div className="rounded-md border">
          <DataTable.Content />
        </div>
        <DataTable.FooterControl showRowCount />
      </div>
    </DataTable>
  ),
}
