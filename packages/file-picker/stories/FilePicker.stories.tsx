import {Meta, StoryFn} from '@storybook/react'
import React from 'react'
import {FilePicker, Props} from '../src/components/FilePicker'

const meta: Meta = {
  title: 'FilePicker',
  component: FilePicker,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: {expanded: true},
  },
}

export default meta

const jwt = 'xxxx'

const Template: StoryFn<Props> = (args) => (
  <FilePicker
    open={true}
    onSelect={(file) => console.log(file)}
    {...args}
    token={jwt}
  />
)

export const Component = Template.bind({})
Component.args = {
  trigger: undefined,
  open: true,
  onClose: () => console.log('closed'),
}
