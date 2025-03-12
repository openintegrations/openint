import React from 'react'
import type {Meta, StoryObj} from '@openint/ui-v1/storybook'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Web/ConnectorConfigSheet',
  component: ConnectorConfigSheet,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes

  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: {onClick: fn()},
  // render: (props) => (
  //   <div className='bg-pink-700 p-5'>
  //     <Button {...props} />,
  //   </div>
  // ),
} satisfies Meta<typeof ConnectorConfigSheet>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

// @ts-expect-error TODO(@snrondina): Fix me, figure out why type fails
export const Primary: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState(false)

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white">
          Open Connector Config
        </button>

        <ConnectorConfigSheet
          connectorName="greenhouse"
          open={open}
          setOpen={setOpen}
        />
      </div>
    )
  },
}
