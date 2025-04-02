import type {Meta, StoryObj} from '@storybook/react'
import {DataTable} from '../components/DataTable'
import {columns, Customer, CustomersTable} from './CustomersTable'

// Sample data for the customers table based on the image
const customers: Customer[] = [
  {
    id: '101',
    connectionsCount: 472,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '102',
    connectionsCount: 238,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '103',
    connectionsCount: 184,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '104',
    connectionsCount: 95,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '105',
    connectionsCount: 312,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '106',
    connectionsCount: 156,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '107',
    connectionsCount: 67,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '108',
    connectionsCount: 43,
    firstCreated: 'May 12, 2025',
  },
  {
    id: '109',
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
  render: (args) => <CustomersTable {...args} />,
}
