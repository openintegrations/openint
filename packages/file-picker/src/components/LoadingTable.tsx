import React from 'react'

interface Props {
  isSearching: boolean
}

export const LoadingTable = ({ isSearching }: Props) => {
  let columns = [
    {
      Header: 'Name'
    },
    {
      Header: 'Size'
    },
    {
      Header: 'Updated'
    }
  ]
  const array = Array.from(Array(6).keys())
  if (isSearching) {
    columns = [...columns, { Header: 'Service' }]
  }

  return (
    <div className="overflow-auto">
      <table className="w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column: any, i: number) => (
              <th
                key={`column-${i}`}
                className={`py-3 space-x-6 text-xs font-medium tracking-wide text-left text-gray-500 uppercase ${
                  i === columns.length - 1 ? 'text-right' : ''
                }`}
              >
                {column.Header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {array.map((_, i) => (
            <LoadingRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const LoadingRow = ({ columns }: { columns: any[] }) => {
  return (
    <tr>
      {columns.map((_, i) => (
        <td
          className={`py-4 space-x-6 text-sm font-medium truncate whitespace-nowrap ${
            i === columns.length - 1 ? 'text-right' : ''
          }`}
          key={`cell-${i}`}
          style={{ maxWidth: 80 }}
        >
          <span className="px-16 py-0 bg-gray-200 rounded-sm animate-pulse"></span>
        </td>
      ))}
    </tr>
  )
}

export default LoadingTable
