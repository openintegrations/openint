import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {initDbPGLite} from '@openint/db/db.pglite'

export function App({className}: {className: string}) {
  const [count, setCount] = React.useState(0)
  React.useEffect(() => {
    void (async () => {
      const db = initDbPGLite()
      const res = await db.$exec('SELECT 1+1 as count')

      setCount(res.rows[0]['count'])
      console.log(res)
    })()
  }, [])
  return <div className={className}>Hello World {count}</div>
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'App',
  component: App,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    // layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   backgroundColor: {control: 'color'},
  // },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: {onClick: fn()},
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    className: 'bg-blue-100 text-white p-4',
  },
}
