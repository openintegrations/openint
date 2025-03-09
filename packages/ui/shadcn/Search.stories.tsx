import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Search } from './Search'

const meta = {
  title: 'UI/Search',
  component: Search,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Search...',
  },
} satisfies Meta<typeof Search>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
}

export const WithValue: Story = {
  args: {
    placeholder: 'Search...',
    defaultValue: 'Search query',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Search...',
    disabled: true,
  },
}

export const WithCustomWidth: Story = {
  args: {
    placeholder: 'Search...',
    className: 'w-[300px]',
  },
} 