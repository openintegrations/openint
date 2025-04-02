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
    <>
      <div className="mb-4 block rounded bg-gray-200 p-4 text-center">
        Current window width: <span className="font-mono">{`${width}px`}</span>
      </div>
      <div className={cn('space-y-4', className)}>
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
    </>
  )
}
const ContainerQueryDemo: FC<MediaQueryDemoProps> = ({className}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      className="@container max-w-[900px] rounded-lg border border-gray-300 bg-gray-100 p-6"
      ref={containerRef}>
      <div className="mb-4 block rounded bg-gray-200 p-4 text-center">
        Container width:{' '}
        <span className="font-mono">{`${containerWidth}px (${(containerWidth / 16).toFixed(2)}rem)`}</span>
      </div>
      <div className={cn('space-y-4', className)}>
        <div className="block rounded bg-red-200 p-4 text-center">
          always visible
        </div>
        <div className="@sm:block hidden rounded bg-blue-200 p-4 text-center">
          @sm and above (320px / 20rem+)
        </div>
        <div className="@md:block hidden rounded bg-green-200 p-4 text-center">
          @md and above (384px / 24rem+)
        </div>
        <div className="@lg:block hidden rounded bg-orange-200 p-4 text-center">
          @lg and above (448px / 28rem+)
        </div>
        <div className="@xl:block hidden rounded bg-indigo-200 p-4 text-center">
          @xl and above (512px / 32rem+)
        </div>
        <div className="@2xl:block hidden rounded bg-purple-200 p-4 text-center">
          @2xl and above (576px / 36rem+)
        </div>
      </div>
    </div>
  )
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: () => null,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ContainerQuery: Story = {
  render: () => <ContainerQueryDemo />,
}

export const MediaQuery: Story = {
  render: () => <MediaQueryDemo />,
}
