import type {Meta, StoryObj} from '@storybook/react'
import {ColumnDef} from '@tanstack/react-table'
import {useState} from 'react'
import {FIXTURES} from '../domain-components/__stories__/fixtures'
import {ConnectionCard} from '../domain-components/ConnectionCard'
import {DataTileView} from './DataTileView'

const meta: Meta<typeof DataTileView> = {
  title: 'Components/DataTileView',
  component: DataTileView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTileView>

// Example with connections
function ConnectionTileView() {
  const [selectedId, setSelectedId] = useState<string>()
  const connections = Object.values(FIXTURES.connections)

  return (
    <DataTileView
      data={connections}
      columns={[]}
      selectedId={selectedId}
      onSelect={(connection) => setSelectedId(connection.id)}
      getItemId={(connection) => connection.id}
      renderItem={(connection) => (
        <ConnectionCard connection={connection} onPress={() => {}} />
      )}
    />
  )
}

// Example with simple items
interface SimpleItem {
  id: string
  name: string
  color: string
  description: string
}

const simpleItems: SimpleItem[] = [
  {id: '1', name: 'Item 1', color: 'bg-red-500', description: 'First item'},
  {id: '2', name: 'Item 2', color: 'bg-blue-500', description: 'Second item'},
  {id: '3', name: 'Item 3', color: 'bg-green-500', description: 'Third item'},
]

const simpleColumns: ColumnDef<SimpleItem>[] = [
  {
    accessorKey: 'name',
    cell: ({row}) => (
      <div className="font-semibold">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'description',
    cell: ({row}) => (
      <div className="text-muted-foreground text-sm">
        {row.getValue('description')}
      </div>
    ),
  },
]

function SimpleTileView() {
  const [selectedId, setSelectedId] = useState<string>()

  return (
    <DataTileView
      data={simpleItems}
      columns={simpleColumns}
      selectedId={selectedId}
      onSelect={(item) => setSelectedId(item.id)}
      getItemId={(item) => item.id}
      renderItem={(item) => (
        <div
          className={`h-32 w-32 rounded-lg ${item.color} flex items-center justify-center font-semibold text-white`}>
          {item.name}
        </div>
      )}
    />
  )
}

export const WithSimpleItems: Story = {
  render: () => <SimpleTileView />,
}

export const WithConnections: Story = {
  render: () => <ConnectionTileView />,
}
