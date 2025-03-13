import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {Input} from './input'

const meta = {
  title: 'Shadcn/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url'],
    },
    placeholder: {control: 'text'},
    disabled: {control: 'boolean'},
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    value: 'Input with value',
    readOnly: true,
  },
}

// Input types
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
}

// Validation states
export const Invalid: Story = {
  args: {
    placeholder: 'Invalid input',
    'aria-invalid': true,
  },
}

// With context
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="with-label" className="text-sm font-medium">
        Email
      </label>
      <Input id="with-label" placeholder="Enter your email" />
    </div>
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="with-helper" className="text-sm font-medium">
        Password
      </label>
      <Input id="with-helper" type="password" placeholder="Enter password" />
      <p className="text-xs text-gray-500">
        Password must be at least 8 characters
      </p>
    </div>
  ),
}

// Sizes
export const Small: Story = {
  args: {
    placeholder: 'Small input',
    className: 'h-8 text-sm',
  },
}

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    className: 'h-12 text-lg',
  },
}

// With icon
export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <Input placeholder="Search..." className="pl-10" />
    </div>
  ),
}
