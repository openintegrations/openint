import {Button} from '@openint/shadcn/ui'
import type {Columns} from '../components/DataTable'
import type {ConnectorConfigTemporary} from './__stories__/fixtures'
import {ConnectorCard, ConnectorTableCell} from './ConnectorCard'

export const CONNECTOR_CONFIG_COLUMNS = [
  {
    id: 'connector',
    header: 'Connector',
    accessorKey: 'display_name',
    cell: ({row}) => {
      const connector = row.original
      // Show the complete ConnectorTableCell with all badges in this column only
      return <ConnectorTableCell connector={connector} />
    },
  },
  {
    id: 'connections',
    header: 'Connections',
    cell: () => {
      // Empty placeholder
      return <span className="text-gray-400">--</span>
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: () => {
      // Empty placeholder
      return <span className="text-gray-400">--</span>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => {
      // Empty placeholder
      return (
        <Button variant="ghost" size="sm">
          View
        </Button>
      )
    },
  },
] satisfies Columns<ConnectorConfigTemporary, string>
