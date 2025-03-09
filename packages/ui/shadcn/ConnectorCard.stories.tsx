import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ConnectorCard } from './ConnectorCard'

// Simple logo for the story
const SalesforceLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#1798c1">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
)

const meta = {
  title: 'UI/ConnectorCard',
  component: ConnectorCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A responsive card component for displaying connector information with badges. The card adapts to mobile screens by taking full width on smaller screens. It includes a hover effect with darker border and background to indicate it\'s clickable.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    oauthType: { 
      control: 'select', 
      options: ['oauth2', 'aggregator', ''] 
    },
    connectorType: { 
      control: 'select', 
      options: ['CRM', 'File Storage', ''] 
    },
    releaseStage: { 
      control: 'select', 
      options: ['GA', 'Beta', ''] 
    },
    connectorVersion: { 
      control: 'select', 
      options: ['V1', 'V2', ''] 
    },
    connectorAudience: { 
      control: 'select', 
      options: ['B2B', 'B2A', ''] 
    },
    onClick: { action: 'clicked' }
  },
  args: {
    name: 'Salesforce',
    logo: <SalesforceLogo />,
    oauthType: 'oauth2',
    connectorType: 'CRM',
    releaseStage: 'GA',
    connectorVersion: 'V2',
    connectorAudience: 'B2B',
  },
} satisfies Meta<typeof ConnectorCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Salesforce',
    logo: <SalesforceLogo />,
    oauthType: 'oauth2',
    connectorType: 'CRM',
    releaseStage: 'GA',
    connectorVersion: 'V2',
    connectorAudience: 'B2B',
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive'
    },
    docs: {
      description: {
        story: 'The default ConnectorCard component showing all badges. This component is responsive and will adapt to different screen sizes. Hover over the card to see the clickable state with a darker border and background effect.'
      }
    }
  }
} 