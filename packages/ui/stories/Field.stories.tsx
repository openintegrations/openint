import type {Meta, StoryObj} from '@storybook/react'
import {Field} from '../shadcn/Field'

const meta: Meta<typeof Field> = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Field>

export const Default: Story = {
  args: {
    placeholder: 'Placeholder',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Password',
    description: 'Password must be at least 8 characters long',
    placeholder: 'Enter your password',
    type: 'password',
  },
}

export const WithError: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    error: 'Username is already taken',
    value: 'johndoe',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'This field is disabled',
    disabled: true,
  },
}