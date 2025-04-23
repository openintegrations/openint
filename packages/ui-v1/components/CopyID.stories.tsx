import type {Meta, StoryObj} from '@storybook/react'

import {CopyID} from './CopyID'

const meta: Meta<typeof CopyID> = {
  title: 'Components/CopyID',
  component: CopyID,
  argTypes: {
    value: {
      control: 'text',
      description: 'The ID or code to be displayed and copied',
    },
    label: {
      control: 'text',
      description: 'Optional label to display before the ID',
    },
    tooltipCopiedText: {
      control: 'text',
      description: 'Text to show in the tooltip after copying',
    },
    tooltipDefaultText: {
      control: 'text',
      description: 'Text to show in the tooltip before copying',
    },
    className: {
      control: 'text',
      description: 'Optional class names',
    },
    width: {
      control: 'text',
      description: 'Width of the component (string or number)',
    },
    size: {
      control: 'select',
      options: ['default', 'medium', 'compact', 'justicon'],
      description: 'Size variant of the component',
    },
    compact: {
      control: 'boolean',
      description:
        'Whether to use the compact size (deprecated, use size instead)',
    },
  },
}

export default meta
type Story = StoryObj<typeof CopyID>

export const Default: Story = {
  args: {
    value: 'CUSID_123456789',
  },
}

export const CustomerId: Story = {
  args: {
    value: 'CUSID_123456789',
  },
}

export const IntegrationId: Story = {
  args: {
    value: 'INTID_abcdefg12345',
  },
}

export const ConnectionId: Story = {
  args: {
    value: 'CONNID_9876543210',
  },
}

export const DifferentWidths: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium">Default width (320px)</div>
      <CopyID value="CUSID_123456789" />

      <div className="text-sm font-medium">Custom width (250px)</div>
      <CopyID value="CUSID_123456789" width={250} />

      <div className="text-sm font-medium">Wide (500px)</div>
      <CopyID value="CUSID_123456789" width="500px" />

      <div className="text-sm font-medium">Full width</div>
      <CopyID value="CUSID_123456789" width="100%" />

      <div className="text-sm font-medium">
        With long ID (truncates with ellipsis)
      </div>
      <CopyID
        value="CUSID_0123456789012345678901234567890123456789"
        width={250}
      />
    </div>
  ),
}

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium">Large size</div>
      <CopyID value="CUSID_123456789" width={300} size="default" />

      <div className="text-sm font-medium">Medium size (default)</div>
      <CopyID value="CUSID_123456789" width={300} />

      <div className="text-sm font-medium">
        Compact size (for PropertyListView)
      </div>
      <CopyID value="CUSID_123456789" width={300} size="compact" />

      <div className="text-sm font-medium">
        Icon-only variant (just the copy button)
      </div>
      <div className="flex items-center gap-4">
        <CopyID value="CUSID_123456789" size="justicon" />
        <span className="text-muted-foreground text-xs">
          ← Hover to see tooltip
        </span>
      </div>
    </div>
  ),
}

export const JustIconVariant: Story = {
  args: {
    value: 'CUSID_123456789',
    size: 'justicon',
  },
  render: (args) => (
    <div className="flex flex-col gap-5">
      <div className="text-sm">
        <p className="mb-2 font-medium">Just Icon Variant</p>
        <p className="text-muted-foreground mb-4 text-xs">
          Shows only the copy icon button without displaying the value. Useful
          for interfaces where space is limited or when the value is displayed
          elsewhere.
        </p>
      </div>

      <div className="bg-muted/20 flex w-fit items-center gap-3 rounded-md border p-3">
        <span className="text-sm">Customer ID:</span>
        <span className="font-mono text-sm">{args.value}</span>
        <CopyID {...args} />
      </div>

      <div className="bg-card mt-4 rounded-md border p-4 shadow-sm">
        <div className="mb-2 text-sm font-medium">
          Example usage in a card header
        </div>
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-base font-semibold">Customer Profile</h3>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Copy ID</span>
            <CopyID value={args.value} size="justicon" />
          </div>
        </div>
        <div className="pt-2 text-sm">
          <p>
            This is sample content where the ID may appear in multiple places.
          </p>
        </div>
      </div>
    </div>
  ),
}
