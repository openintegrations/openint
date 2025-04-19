import type {Meta, StoryObj} from '@storybook/react'
import type {AppRouterOutput} from '@openint/api-v1'

import {DataTable} from '../../components/DataTable'
import {CustomersTable} from './CustomerTable'

type PaginatedData<T> = {
  items: T[]
  total: number
  limit: number
  offset: number
}

const customers: PaginatedData<
  AppRouterOutput['listCustomers']['items'][number]
> = {
  items: [
    {
      id: Math.random().toString(36).substring(2, 10),
      connection_count: 472,
      created_at: new Date('2025-05-12').toISOString(),
      updated_at: new Date('2025-05-12').toISOString(),
    },
    {
      id: Math.random().toString(36).substring(2, 10),
      connection_count: 238,
      created_at: new Date('2025-05-12').toISOString(),
      updated_at: new Date('2025-05-12').toISOString(),
    },
    {
      id: Math.random().toString(36).substring(2, 10),
      connection_count: 184,
      created_at: new Date('2025-05-12').toISOString(),
      updated_at: new Date('2025-05-12').toISOString(),
    },
    {
      id: Math.random().toString(36).substring(2, 10),
      connection_count: 95,
      created_at: new Date('2025-05-12').toISOString(),
      updated_at: new Date('2025-05-12').toISOString(),
    },
  ],
  total: 4,
  limit: 10,
  offset: 0,
}

const meta: Meta<typeof DataTable> = {
  title: 'Domain Components/CustomersTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof CustomersTable>

export const Default: Story = {
  args: {
    data: customers,
    onPageChange: () => {},
    isLoading: false,
  },
  render: (args) => <CustomersTable {...args} />,
}
