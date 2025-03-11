import React, {useState} from 'react'
import FilterBadge from '../components/FilterBadge'

export default {
  title: 'UI/Badges/FilterBadge',
  component: FilterBadge,
  parameters: {
    layout: 'centered',
  },
}

export const Default = () => (
  <FilterBadge label="Filter" onRemove={() => console.log('removed')} />
)

export const WithLongText = () => (
  <FilterBadge
    label="This is a very long filter text that should be truncated"
    onRemove={() => console.log('removed')}
  />
)

export const WithoutRemove = () => <FilterBadge label="Static Filter" />

// Interactive example showing multiple filter badges
export const MultipleFilters = () => {
  const [filters, setFilters] = useState(['CRM', 'Marketing', 'Analytics'])

  const handleRemove = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <FilterBadge
          key={filter}
          label={filter}
          onRemove={() => handleRemove(filter)}
        />
      ))}
      {filters.length === 0 && (
        <p className="text-sm text-gray-500">All filters removed</p>
      )}
    </div>
  )
}

export const CustomStyling = () => (
  <FilterBadge
    label="Custom Style"
    onRemove={() => console.log('Filter removed')}
    className="bg-blue-100 text-blue-800"
  />
)
