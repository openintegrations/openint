import type {Meta, StoryObj} from '@storybook/react'
import {FIXTURES} from './__stories__/fixtures'
import {ConnectorBadges} from './ConnectorCard'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI-V1/ConnectorBadges',
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
    connector: {
      name: 'default',
      stage: 'ga' as 'ga' | 'beta' | 'alpha',
      platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {Object.values(FIXTURES.connectors).map((connector, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-24 font-medium">{connector.name}:</span>
          <ConnectorBadges connector={connector} />
        </div>
      ))}
    </div>
  ),
}

// GA stage with web platform
export const GAStage: Story = {
  args: {
    connector: {
      name: 'salesforce',
      stage: 'ga' as 'ga' | 'beta' | 'alpha',
      // platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    },
  },
}

// Beta stage with multiple platforms
export const BetaStage: Story = {
  args: {
    connector: {
      name: 'hubspot',
      stage: 'beta' as 'ga' | 'beta' | 'alpha',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
  },
}

// Alpha stage with single platform
export const AlphaStage: Story = {
  args: {
    connector: {
      name: 'notion',
      stage: 'alpha' as 'ga' | 'beta' | 'alpha',
      platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    },
  },
}

// Many platforms to demonstrate the +X indicator on mobile
export const ManyPlatforms: Story = {
  args: {
    connector: {
      name: 'multi-platform',
      stage: 'ga' as 'ga' | 'beta' | 'alpha',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
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
    connector: {
      name: 'mobile-view',
      stage: 'beta' as 'ga' | 'beta' | 'alpha',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
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
    connector: {
      name: 'desktop-view',
      stage: 'beta' as 'ga' | 'beta' | 'alpha',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
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
    connector: {
      name: 'platforms-only',
      platforms: ['web', 'mobile'] as ('web' | 'mobile' | 'desktop')[],
    },
  },
}

// No platforms, only stage
export const StageOnly: Story = {
  args: {
    connector: {
      name: 'stage-only',
      stage: 'ga' as 'ga' | 'beta' | 'alpha',
    },
  },
}

// All possible platforms
export const AllPlatforms: Story = {
  args: {
    connector: {
      name: 'all-platforms',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
  },
}
