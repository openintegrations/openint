import type {Meta, StoryObj} from '@storybook/react'
import type {AppRouterOutput} from '@openint/api-v1'
import {DataTable} from '../../components/DataTable'
import {CustomersTable} from './CustomerTable'

const customers: AppRouterOutput['listCustomers']['items'] = [
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
]

const meta: Meta<typeof DataTable> = {
  title: 'Domain Components/CustomersTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<
  typeof DataTable<AppRouterOutput['listCustomers']['items'][number], unknown>
>

export const Default: Story = {
  args: {
    data: customers,
  },
  render: (args) => <CustomersTable {...args} />,
}
