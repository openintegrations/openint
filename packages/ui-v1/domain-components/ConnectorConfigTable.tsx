import type {ColumnDef} from '@tanstack/react-table'
import {Button} from '@openint/shadcn/ui'
import type {Columns} from '../components/DataTable'
import type {ConnectorConfigTemporary} from './__stories__/fixtures'
import {ConnectorTableCell} from './ConnectorTableCell'

// Debug component to see what's in the data
const DebugData = ({data}: {data: any}) => (
  <div style={{display: 'none'}}>{JSON.stringify(data)}</div>
)

export const CONNECTOR_CONFIG_COLUMNS: Array<
  ColumnDef<ConnectorConfigTemporary, string>
> = [
  {
    id: 'connector',
    header: 'Connector',
    accessorKey: 'connector.display_name',
    cell: ({row}) => {
      const connectorConfig = row.original

      // For debugging
      console.log('Row data:', connectorConfig)

      // Add null check for connector
      if (!connectorConfig || !connectorConfig.connector) {
        console.error('Missing connector data:', connectorConfig)
        return (
          <>
            <DebugData data={connectorConfig} />
            <span className="text-gray-400">--</span>
          </>
        )
      }

      // Show the complete ConnectorTableCell with all badges in this column only
      return (
        <>
          <DebugData data={connectorConfig.connector} />
          <ConnectorTableCell connector={connectorConfig.connector} />
        </>
      )
    },
  },
  {
    id: 'connections',
    header: 'Connections',
    accessorKey: 'connection_count',
    cell: ({row}) => {
      const count = row.original.connection_count
      return count !== undefined ? (
        count
      ) : (
        <span className="text-gray-400">--</span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: () => (
      // Empty placeholder
      <span className="text-gray-400">--</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      // Empty placeholder
      <Button variant="ghost" size="sm">
        View
      </Button>
    ),
  },
] satisfies Columns<ConnectorConfigTemporary, string>
