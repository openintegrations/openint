import {type Customer} from '@openint/api-v1/models'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

const columns: ColumnDef<Customer>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
  },
  {
    id: 'org_id',
    header: 'Org ID',
    accessorKey: 'org_id',
  },
  {
    id: 'connection_count',
    header: '# Connections',
    accessorKey: 'connection_count',
  },
  {
    id: 'created_at',
    header: 'Created At',
    accessorKey: 'created_at',
  },
  {
    id: 'updated_at',
    header: 'Updated At',
    accessorKey: 'updated_at',
  },
]

export function CustomerList(props: {
  initialData?: {
    items: Array<Customer>
    total: number
    limit: number
    offset: number
  }
}) {
  const {initialData} = props
  const trpc = useTRPC()
  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions(
      {},
      initialData ? {initialData} : undefined,
    ),
  )

  return (
    <DataTable<Customer, string | number | string[]>
      data={customerData.data.items}
      columns={columns}>
      <DataTable.Header>
        <DataTable.SearchInput />
        <DataTable.ColumnVisibilityToggle />
      </DataTable.Header>
      <DataTable.Table />
      <DataTable.Footer>
        <DataTable.Pagination />
      </DataTable.Footer>
    </DataTable>
  )
}
