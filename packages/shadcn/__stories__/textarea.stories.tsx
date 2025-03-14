// packages/shadcn/__stories__/textarea.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'
import {Label} from '../ui/label'
import {Textarea} from '../ui/textarea'

const meta = {
  title: 'Shadcn/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {control: 'text'},
    disabled: {control: 'boolean'},
    rows: {control: 'number'},
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled.',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    value: 'This is some example text that has been entered into the textarea.',
    readOnly: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea
        id="message"
        placeholder="Type your message here."
        className="min-h-32"
      />
    </div>
  ),
}

export const WithLabelAndHelperText: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-with-help">Your feedback</Label>
      <Textarea
        id="message-with-help"
        placeholder="Please provide your feedback here."
        className="min-h-32"
      />
      <p className="text-muted-foreground text-sm">
        Your feedback will be sent to our team for review.
      </p>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-error" className="text-destructive">
        Bio
      </Label>
      <Textarea
        id="message-error"
        aria-invalid={true}
        placeholder="Please enter your bio."
        className="min-h-32"
      />
      <p className="text-destructive text-sm">
        Bio is required and must be at least 10 characters.
      </p>
    </div>
  ),
}
