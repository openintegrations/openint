import type {Meta, StoryObj} from '@storybook/react'
import {
  Calendar,
  Globe,
  Lock,
  MailOpen,
  Phone,
  PieChart,
  Settings,
  Star,
  Tag,
  User,
} from 'lucide-react'
import {useState} from 'react'
import {MultiSelect} from './multi-select'

const meta: Meta<typeof MultiSelect> = {
  title: 'UI-V1/Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MultiSelect>

// Sample options with icons
const sampleOptions = [
  {label: 'User', value: 'user', icon: User},
  {label: 'Calendar', value: 'calendar', icon: Calendar},
  {label: 'Mail', value: 'mail', icon: MailOpen},
  {label: 'Tag', value: 'tag', icon: Tag},
  {label: 'Globe', value: 'globe', icon: Globe},
  {label: 'Phone', value: 'phone', icon: Phone},
  {label: 'Analytics', value: 'analytics', icon: PieChart},
  {label: 'Settings', value: 'settings', icon: Settings},
  {label: 'Security', value: 'security', icon: Lock},
  {label: 'Favorite', value: 'favorite', icon: Star},
]

// Default empty state
export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select items...',
    onValueChange: () => {},
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
}

// With preselected values
export const WithPreselectedValues: Story = {
  args: {
    options: sampleOptions,
    defaultValue: ['user', 'calendar'],
    onValueChange: () => {},
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
}

// With animation
export const WithAnimation: Story = {
  args: {
    options: sampleOptions,
    defaultValue: ['user', 'calendar', 'mail'],
    animation: 0.5,
    onValueChange: () => {},
  },
  render: (args) => (
    <div className="w-[400px]">
      <MultiSelect {...args} />
    </div>
  ),
}

// With different variants
const VariantsStory = () => {
  const [values1, setValues1] = useState<string[]>(['user'])
  const [values2, setValues2] = useState<string[]>(['calendar'])
  const [values3, setValues3] = useState<string[]>(['mail'])

  return (
    <div className="flex w-[400px] flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Default Variant</p>
        <MultiSelect
          options={sampleOptions}
          defaultValue={values1}
          onValueChange={setValues1}
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Secondary Variant</p>
        <MultiSelect
          options={sampleOptions}
          defaultValue={values2}
          onValueChange={setValues2}
          variant="secondary"
        />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">
          Destructive Variant
        </p>
        <MultiSelect
          options={sampleOptions}
          defaultValue={values3}
          onValueChange={setValues3}
          variant="destructive"
        />
      </div>
    </div>
  )
}

export const Variants: Story = {
  render: () => <VariantsStory />,
}

// Interactive example with many selections
const InteractiveStory = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  return (
    <div className="w-[400px]">
      <MultiSelect
        options={sampleOptions}
        onValueChange={setSelectedValues}
        defaultValue={selectedValues}
        placeholder="Select options..."
      />
      <div className="mt-4 rounded-md border p-4">
        <h3 className="text-sm font-medium">Selected Values:</h3>
        <div className="mt-2">
          {selectedValues.length > 0 ? (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {selectedValues.map((value) => (
                <li key={value}>
                  {sampleOptions.find((opt) => opt.value === value)?.label ||
                    value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No values selected</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveStory />,
}

// With maxCount limit
export const WithMaxCount: Story = {
  args: {
    options: sampleOptions,
    defaultValue: ['user', 'calendar', 'mail', 'tag', 'globe', 'phone'],
    onValueChange: () => {},
    maxCount: 3,
  },
  render: (args) => (
    <div className="w-[400px]">
      <p className="text-muted-foreground mb-2 text-sm">
        MaxCount={args.maxCount} (shows &ldquo;+3 more&rdquo; badge)
      </p>
      <MultiSelect {...args} />
    </div>
  ),
}

// MultiSelect inside a form-like container
const FormStory = () => {
  const [values, setValues] = useState<string[]>([])

  return (
    <div className="w-[500px] space-y-4 rounded-md border p-6">
      <h2 className="text-lg font-semibold">User Preferences</h2>

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          className="border-input w-full rounded-md border px-3 py-2"
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          className="border-input w-full rounded-md border px-3 py-2"
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notifications" className="text-sm font-medium">
          Notification Preferences
        </label>
        <MultiSelect
          id="notifications"
          options={sampleOptions}
          onValueChange={setValues}
          defaultValue={values}
          placeholder="Select notification types..."
        />
        <p className="text-muted-foreground text-xs">
          Choose which types of notifications you&apos;d like to receive
        </p>
      </div>

      <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
        Save Preferences
      </button>
    </div>
  )
}

export const InForm: Story = {
  render: () => <FormStory />,
}
