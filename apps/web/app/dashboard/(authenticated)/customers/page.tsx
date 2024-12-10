'use client'

import {Copy, MoreHorizontal, RefreshCcw} from 'lucide-react'
import type {RouterOutput} from '@openint/engine-backend'
import {_trpcReact} from '@openint/engine-frontend'
import {
  Button,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useToast,
} from '@openint/ui'

export default function CustomersPage() {
  const res = _trpcReact.adminSearchCustomers.useQuery({})

  // Function to format dates
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }

  return (
    <div className="p-6">
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">End Users</h2>
      <p className="mb-4 text-sm text-gray-600">
        View and manage your customers and their associated connections.
      </p>
      <DataTable
        query={res}
        columns={[
          {
            id: 'actions',
            cell: ({row}) => <CustomerMenu customer={row.original} />,
          },
          {accessorKey: 'id'},
          {accessorKey: 'connectionCount', header: '# Connections'},
          {
            accessorKey: 'firstCreatedAt',
            header: 'First created',
            cell: ({row}) => formatDate(row.original.firstCreatedAt ?? ''),
          },
          {
            accessorKey: 'lastUpdatedAt',
            header: 'Last updated',
            cell: ({row}) => formatDate(row.original.lastUpdatedAt ?? ''),
          },
        ]}
      />
    </div>
  )
}

type Customer = RouterOutput['adminSearchCustomers'][number]

function CustomerMenu({customer}: {customer: Customer}) {
  const {toast} = useToast()
  const createMagicLink = _trpcReact.createMagicLink.useMutation({})

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(customer.id)}>
          <Copy className="mr-2 h-4 w-4" />
          <div>
            Copy End User ID
            <br />
            <pre className="text-muted-foreground">{customer.id}</pre>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            createMagicLink
              .mutateAsync({customerId: customer.id})
              .then((res) => {
                // This is a problem because due to pop up blockers not liking it async...
                window.open(res.url)
              })
              .catch((err) =>
                toast({
                  title: 'Failed to create connect token',
                  description: `${err}`,
                  variant: 'destructive',
                }),
              )
          }}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Generate Magic Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
