import type {Meta, StoryObj} from '@storybook/react'

import {useState} from 'react'
import {SecureInput} from './SecureInput'

const meta: Meta<typeof SecureInput> = {
  title: 'Components/SecureInput',
  component: SecureInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the secure input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to show the value by default',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the input is read-only',
    },
    value: {
      control: 'text',
      description: 'The input value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when the input value changes',
    },
  },
}

export default meta
type Story = StoryObj<typeof SecureInput>

// Basic example with defaults
export const Default: Story = {
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    value: '',
  },
}

// Example with pre-filled value that is hidden
export const WithHiddenValue: Story = {
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    value: 'sk_test_abcdefghijklmnopqrstuvwxyz123456',
    showValue: false,
  },
}

// Example with pre-filled value that is shown
export const WithVisibleValue: Story = {
  args: {
    label: 'API Key',
    placeholder: 'Enter your API key',
    value: 'sk_test_abcdefghijklmnopqrstuvwxyz123456',
    showValue: true,
  },
}

// Example with read-only state
export const ReadOnly: Story = {
  args: {
    label: 'Read-only API Key',
    value: 'sk_test_abcdefghijklmnopqrstuvwxyz123456',
    readOnly: true,
  },
}

// Interactive example with state management
export const Interactive: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(
      'sk_test_abcdefghijklmnopqrstuvwxyz123456',
    )
    return (
      <SecureInput
        {...args}
        label="Interactive API Key"
        placeholder="Enter your API key"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}

// Example showing different label styles
export const WithDifferentLabels: Story = {
  render: () => (
    <div className="flex flex-col space-y-6">
      <SecureInput
        label="API Key"
        value="sk_test_abcdefghijklmnopqrstuvwxyz123456"
      />
      <SecureInput
        label="Secret Token"
        value="secret_abcdefghijklmnopqrstuvwxyz123456"
      />
      <SecureInput label="Password" value="password123!" />
    </div>
  ),
}

// Example showing various states in a grid
export const MultipleVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-4 text-sm font-medium text-gray-500">
          Default (Empty)
        </h3>
        <SecureInput
          label="API Key"
          placeholder="Enter your API key"
          value=""
        />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-gray-500">
          With Hidden Value
        </h3>
        <SecureInput
          label="API Key"
          placeholder="Enter your API key"
          value="sk_test_abcdefghijklmnopqrstuvwxyz123456"
        />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-gray-500">
          With Visible Value
        </h3>
        <SecureInput
          label="API Key"
          placeholder="Enter your API key"
          value="sk_test_abcdefghijklmnopqrstuvwxyz123456"
          showValue={true}
        />
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-gray-500">Read-only</h3>
        <SecureInput
          label="API Key"
          value="sk_test_abcdefghijklmnopqrstuvwxyz123456"
          readOnly={true}
        />
      </div>
    </div>
  ),
}
