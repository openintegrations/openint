import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import OAuthLabelType from './OAuthLabelType'

const meta = {
  title: 'UI/Badges/OAuthLabelType',
  component: OAuthLabelType,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['variant1', 'variant2', 'variant3', 'variant4', 'variant5'],
    },
  },
  args: {
    children: 'Badge',
  },
} satisfies Meta<typeof OAuthLabelType>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'variant1',
  },
}

export const Variant2: Story = {
  args: {
    variant: 'variant2',
  },
}

export const Variant3: Story = {
  args: {
    variant: 'variant3',
  },
}

export const Variant4: Story = {
  args: {
    variant: 'variant4',
  },
}

export const Variant5: Story = {
  args: {
    variant: 'variant5',
  },
} 