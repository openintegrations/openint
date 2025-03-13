import type {Meta, StoryObj} from '@storybook/react'
import React, {type FC} from 'react'
import {cn} from '@openint/shadcn/lib/utils'

interface MediaQueryDemoProps {
  className?: string
}

const MediaQueryDemo: FC<MediaQueryDemoProps> = ({className}) => {
  const [width, setWidth] = React.useState(window.innerWidth)

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="block rounded bg-gray-200 p-4 text-center">
        Current window width: <span className="font-mono">{`${width}px`}</span>
      </div>
      <div className="block rounded bg-red-200 p-4 text-center">
        always visible
      </div>
      <div className="hidden rounded bg-blue-200 p-4 text-center sm:block">
        sm and above (640px+)
      </div>
      <div className="hidden rounded bg-green-200 p-4 text-center md:block">
        md and above (768px+)
      </div>
      <div className="hidden rounded bg-orange-200 p-4 text-center lg:block">
        lg and above (1024px+)
      </div>
      <div className="hidden rounded bg-indigo-200 p-4 text-center xl:block">
        xl and above (1280px+)
      </div>
      <div className="hidden rounded bg-purple-200 p-4 text-center 2xl:block">
        2xl and above (1536px+)
      </div>
    </div>
  )
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'MediaQuery',
  component: MediaQueryDemo,
} satisfies Meta<typeof MediaQueryDemo>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {}
