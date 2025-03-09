import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import FilterBadge from './FilterBadge'

const meta = {
  title: 'UI/Badges/FilterBadge',
  component: FilterBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The text to display in the badge',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when the remove button is clicked',
    },
  },
} satisfies Meta<typeof FilterBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Filter',
  },
}

export const WithRemoveButton: Story = {
  args: {
    label: 'Category: CRM',
    onRemove: () => console.log('Filter removed'),
  },
}

// Interactive example showing multiple filter badges
export const MultipleFilters = () => {
  const [filters, setFilters] = useState(['CRM', 'Marketing', 'Analytics']);
  
  const handleRemove = (filter: string) => {
    setFilters(filters.filter(f => f !== filter));
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
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
  );
}

export const CustomStyling: Story = {
  args: {
    label: 'Custom Style',
    onRemove: () => console.log('Filter removed'),
    className: 'bg-blue-100 text-blue-800',
  },
} 