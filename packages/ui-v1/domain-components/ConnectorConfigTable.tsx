import type {Columns} from '../components/DataTable'
import type {ConnectorConfigTemporary} from './__stories__/fixtures'
import {ConnectorCard} from './ConnectorCard'

export const CONNECTOR_CONFIG_COLUMNS = [
  {
    id: 'connector',
    header: 'Connector',
    /** Still needed for search */
    accessorKey: 'connector_name',
    // TODO: Use the tableCell variant of card
    cell: ({row}) => <ConnectorCard connector={row.original.connector} />,
  },
  {
    id: 'connection_count',
    header: 'Connection Count',
    accessorKey: 'connection_count',
  },
] satisfies Columns<ConnectorConfigTemporary, string>
