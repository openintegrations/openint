import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { CheckboxFilter } from '../components/CheckboxFilter'
import { FilterBadges } from '../components/FilterBadges'

// Interactive wrapper component for the story
const InteractiveCheckboxFilter = ({ initialCheckedState = {} }) => {
  // Categories similar to what's used in IntegrationSearch
  const categories = ['crm', 'file-storage', 'marketing', 'analytics', 'communication'];
  
  // State for selected categories
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    Object.entries(initialCheckedState)
      .filter(([_, isChecked]) => isChecked)
      .map(([category]) => category)
  );
  
  // State for the checkbox filter
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() => {
    // Check if initialCheckedState is a non-empty object
    if (typeof initialCheckedState === 'object' && 
        initialCheckedState !== null && 
        Object.keys(initialCheckedState).length > 0) {
      return initialCheckedState;
    }
    
    // Otherwise, initialize with all options unchecked
    return categories.reduce(
      (acc, option) => {
        acc[option] = false;
        return acc;
      },
      {} as Record<string, boolean>
    );
  });

  // Clear all filters
  const onClearFilter = () => {
    setCategoryFilter([]);
    setCheckedState(
      categories.reduce(
        (acc, option) => ({...acc, [option]: false}),
        {} as Record<string, boolean>,
      ),
    );
  };

  // Handle checkbox change
  const onCheckboxChange = (id: string) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Apply selected filters
  const onApplyFilter = (selected: string[]) => {
    setCategoryFilter(selected);
  };

  return (
    <div className="flex flex-col gap-4 w-[600px]">
      <div className="flex flex-row gap-2">
        <div className="relative w-[450px]">
          <input
            placeholder="Search or pick a connector for your setup"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <CheckboxFilter
          options={categories}
          onApply={onApplyFilter}
          checkedState={checkedState}
          onCheckboxChange={onCheckboxChange}
          onClearFilter={onClearFilter}
        />
      </div>
      <FilterBadges
        filters={categoryFilter}
        onClick={(filter) => {
          setCategoryFilter(categoryFilter.filter((f) => f !== filter));
          setCheckedState((prevState) => ({
            ...prevState,
            [filter]: false,
          }));
        }}
      />
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-2">Selected Filters:</h3>
        {categoryFilter.length > 0 ? (
          <ul className="list-disc pl-5">
            {categoryFilter.map(filter => (
              <li key={filter}>{filter}</li>
            ))}
          </ul>
        ) : (
          <p>No filters selected</p>
        )}
      </div>
    </div>
  );
};

const meta = {
  title: 'UI/CheckboxFilter',
  component: CheckboxFilter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox filter component with a popover that allows users to select multiple options and apply filters. This component is used in the IntegrationSearch component to filter integrations by category.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxFilter>

export default meta
type Story = StoryObj<typeof CheckboxFilter>

export const Default: Story = {
  render: () => <InteractiveCheckboxFilter />,
  parameters: {
    docs: {
      description: {
        story: 'Default CheckboxFilter component with category options. This example is fully interactive - you can select filters, apply them, and see the results.'
      }
    }
  }
}

export const WithPreselectedOptions: Story = {
  render: () => <InteractiveCheckboxFilter initialCheckedState={{
    'crm': true,
    'file-storage': false,
    'marketing': true,
    'analytics': false,
    'communication': false,
  }} />,
  parameters: {
    docs: {
      description: {
        story: 'CheckboxFilter with some options pre-selected (CRM and Marketing). This example is fully interactive - you can modify the filters, apply them, and see the results.'
      }
    }
  }
} 