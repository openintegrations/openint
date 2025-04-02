import type {Meta, StoryObj} from '@storybook/react'
import {DataTable} from '../components/DataTable'
import {columns, Customer, CustomersTable} from './CustomersTable'

// Sample data for the customers table based on the image
const customers: Customer[] = [
  {
    id: Math.random().toString(36).substring(2, 10),
    connectionsCount: 472,
    firstCreated: new Date('2025-05-12').toISOString(),
  },
  {
    id: Math.random().toString(36).substring(2, 10),
    connectionsCount: 238,
    firstCreated: new Date('2025-05-12').toISOString(),
  },
  {
    id: Math.random().toString(36).substring(2, 10),
    connectionsCount: 184,
    firstCreated: new Date('2025-05-12').toISOString(),
  },
  {
    id: Math.random().toString(36).substring(2, 10),
    connectionsCount: 95,
    firstCreated: new Date('2025-05-12').toISOString(),
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
  render: (args) => <CustomersTable {...args} />,
}
