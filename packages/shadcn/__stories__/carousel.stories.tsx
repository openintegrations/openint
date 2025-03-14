// packages/shadcn/__stories__/carousel.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Shadcn/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'], // Try commenting this out like in ConnectorCard
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Add some basic args to match the pattern
    orientation: 'horizontal',
    className: 'w-full max-w-xs',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({length: 5}).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="bg-muted flex aspect-square items-center justify-center rounded-md p-6">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    className: 'h-[300px] w-full max-w-xs',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent className="h-[300px]">
        {Array.from({length: 5}).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div className="bg-muted flex aspect-square items-center justify-center rounded-md p-6">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const CustomContent: Story = {
  args: {
    className: 'w-full max-w-md',
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        <CarouselItem>
          <div className="p-1">
            <div className="bg-primary text-primary-foreground rounded-md p-6">
              <h3 className="text-xl font-bold">First Slide</h3>
              <p className="text-sm">This is the first slide content.</p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <div className="bg-secondary text-secondary-foreground rounded-md p-6">
              <h3 className="text-xl font-bold">Second Slide</h3>
              <p className="text-sm">This is the second slide content.</p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="p-1">
            <div className="bg-accent text-accent-foreground rounded-md p-6">
              <h3 className="text-xl font-bold">Third Slide</h3>
              <p className="text-sm">This is the third slide content.</p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
