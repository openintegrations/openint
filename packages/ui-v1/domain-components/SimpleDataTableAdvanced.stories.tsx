import type {Meta, StoryObj} from '@storybook/react'
import {useCallback, useState} from 'react'
import {SimpleDataTable} from './SimpleDataTable'

// Generate a large dataset
const generateData = (count: number) => {
  const data = []
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Support',
    'HR',
    'Finance',
  ]
  const locations = [
    'New York',
    'San Francisco',
    'London',
    'Tokyo',
    'Berlin',
    'Sydney',
  ]

  for (let i = 1; i <= count; i++) {
    data.push({
      id: `EMP-${i.toString().padStart(4, '0')}`,
      name: `Employee ${i}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      salary: Math.floor(50000 + Math.random() * 100000),
      joinDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split('T')[0],
      isActive: Math.random() > 0.2,
    })
  }

  return data
}

// Generate 100 employees
const largeDataset = generateData(100)

// Advanced demo component
const AdvancedDataTableDemo = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  )

  // Define columns with formatting
  const columns = [
    {
      accessorKey: 'id',
      header: 'Employee ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({row}: {row: {original: any}}) => (
        <span className="font-medium">{row.original.department}</span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({row}: {row: {original: any}}) => (
        <span className="font-mono">
          ${row.original.salary.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({row}: {row: {original: any}}) => (
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.original.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </div>
      ),
    },
  ]

  // Custom filter function
  const filterByDepartment = useCallback(
    (employee: any) => {
      if (!selectedDepartment) return true
      return employee.department === selectedDepartment
    },
    [selectedDepartment],
  )

  // Department filter buttons
  const departments = [
    ...new Set(largeDataset.map((emp) => emp.department)),
  ] as string[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Employee Directory</h2>
        <p className="mb-4 text-gray-500">
          This example demonstrates a large dataset with filtering capabilities.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`rounded-md px-3 py-1 text-sm ${
              selectedDepartment === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}>
            All Departments
          </button>

          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedDepartment === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
              {dept}
            </button>
          ))}
        </div>
      </div>

      <SimpleDataTable
        data={largeDataset}
        columns={columns}
        filter={filterByDepartment}
        enableSelect
      />
    </div>
  )
}

const meta: Meta = {
  title: 'DOMAIN COMPONENTS/SimpleDataTableAdvanced',
  component: AdvancedDataTableDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Example of using SimpleDataTable with a large dataset and filtering',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AdvancedExample: Story = {}
