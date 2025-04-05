import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {MultiSelect} from './MultiSelect'

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof meta>

const items = [
  'recents',
  'home',
  'applications',
  'desktop',
  'downloads',
  'documents',
  'pictures',
  'videos',
  'music',
  'cloud',
  'favorites',
  'shared',
  'trash',
  'archives',
  'projects',
  'work',
  'personal',
  'templates',
  'backups',
  'scripts',
  'code',
  'design',
  'notes',
  'presentations',
  'spreadsheets',
  'databases',
  'external',
  'network',
  'system',
  'utilities',
]

const MultiSelectWithState = () => {
  const [selected, setSelected] = React.useState<string[]>([])

  return (
    <MultiSelect
      value={selected}
      onChange={(newValue) => {
        console.log('Selected values:', newValue)
        setSelected(newValue)
      }}
      items={items}
    />
  )
}

export const Default: Story = {
  render: () => <MultiSelectWithState />,
}
