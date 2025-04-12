import type {Meta, StoryObj} from '@storybook/react'

import {ConnectorBadges} from '../ConnectorCard'
import {FIXTURES} from './fixtures'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: ConnectorBadges,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // Using decorators to provide a container with padding and width constraints
} satisfies Meta<typeof ConnectorBadges>

export default meta
type Story = StoryObj<typeof meta>

// Multiple connectors in a list
export const Default: Story = {
  args: {
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },

  render: () => (
    <div className="flex flex-col gap-4">
      {Object.values(FIXTURES.connectors).map((connector, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-24 font-medium">{connector.name}:</span>
          <ConnectorBadges
            stage={connector.stage}
            platforms={connector.platforms}
          />
        </div>
      ))}
    </div>
  ),
}

// GA stage with web platform
export const GAStage: Story = {
  args: {
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },
}

// Beta stage with multiple platforms
export const BetaStage: Story = {
  args: {
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as Array<
      'web' | 'mobile' | 'desktop'
    >,
  },
}

// Alpha stage with single platform
export const AlphaStage: Story = {
  args: {
    stage: 'alpha' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },
}

// Many platforms to demonstrate the +X indicator on mobile
export const ManyPlatforms: Story = {
  args: {
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as Array<
      'web' | 'mobile' | 'desktop'
    >,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'This story demonstrates how badges appear on mobile with the +X indicator when there are more than 2 badges.',
      },
    },
  },
}

// Mobile view with limited badges
export const MobileView: Story = {
  args: {
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as Array<
      'web' | 'mobile' | 'desktop'
    >,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view showing limited badges with +X indicator.',
      },
    },
  },
}

// Desktop view with all badges
export const DesktopView: Story = {
  args: {
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as Array<
      'web' | 'mobile' | 'desktop'
    >,
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'Desktop view showing all badges.',
      },
    },
  },
}

// No stage, only platforms
export const PlatformsOnly: Story = {
  args: {
    platforms: ['web', 'mobile'] as Array<'web' | 'mobile' | 'desktop'>,
  },
}

// No platforms, only stage
export const StageOnly: Story = {
  args: {
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
  },
}

// All possible platforms
export const AllPlatforms: Story = {
  args: {
    platforms: ['web', 'mobile', 'desktop'] as Array<
      'web' | 'mobile' | 'desktop'
    >,
  },
}
