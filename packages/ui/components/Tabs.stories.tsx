import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Tabs } from './Tabs'
import { Circle } from 'lucide-react'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../shadcn/Tabs'

// Custom Tabs component for the stories that allows custom status indicators
const CustomTabs = ({ 
  tabConfig, 
  defaultValue, 
  value, 
  onValueChange, 
  className 
}: {
  tabConfig: Array<{
    key: string
    title: string
    content: React.ReactElement
    customStatus?: React.ReactNode
  }>
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) => {
  return (
    <ShadcnTabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}>
      <TabsList>
        {tabConfig.map((config) => (
          <TabsTrigger key={config.key} value={config.key}>
            {config.title}{' '}
            {config.customStatus}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabConfig.map((config) => (
        <TabsContent
          key={config.key}
          value={config.key}
          defaultValue={defaultValue}>
          {config.content}
        </TabsContent>
      ))}
    </ShadcnTabs>
  )
}

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tabbed interface component that allows switching between different content panels. It supports status indicators and custom styling.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof Tabs>

// Interactive wrapper component for the story
const InteractiveTabs = ({ controlled = false, withStatus = false, customStatus = false }) => {
  const [activeTab, setActiveTab] = useState('tab1');
  
  // Create standard tab config for the regular Tabs component
  const standardTabConfig = [
    {
      key: 'tab1',
      title: 'Tab 1',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 1</div>,
      status: withStatus,
      statusFill: '#10B981', // green
    },
    {
      key: 'tab2',
      title: 'Tab 2',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 2</div>,
      status: withStatus,
      statusFill: '#F59E0B', // amber
    },
    {
      key: 'tab3',
      title: 'Tab 3',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 3</div>,
      status: withStatus,
      statusFill: '#EF4444', // red
    },
  ];
  
  // Create custom tab config for the CustomTabs component
  const customTabConfig = [
    {
      key: 'tab1',
      title: 'Tab 1',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 1</div>,
      customStatus: <div className="ml-2 w-2 h-2 rounded-full self-start" style={{ backgroundColor: '#10B981' }} />
    },
    {
      key: 'tab2',
      title: 'Tab 2',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 2</div>,
      customStatus: <div className="ml-2 w-2 h-2 rounded-full self-start" style={{ backgroundColor: '#F59E0B' }} />
    },
    {
      key: 'tab3',
      title: 'Tab 3',
      content: <div className="p-4 border rounded-md bg-white">This is the content for Tab 3</div>,
      customStatus: <div className="ml-2 w-2 h-2 rounded-full self-start" style={{ backgroundColor: '#EF4444' }} />
    },
  ];
  
  return (
    <div className="w-[600px]">
      {controlled ? (
        <>
          {customStatus ? (
            <CustomTabs 
              tabConfig={customTabConfig}
              value={activeTab}
              onValueChange={setActiveTab}
            />
          ) : (
            <Tabs 
              tabConfig={standardTabConfig}
              value={activeTab}
              onValueChange={setActiveTab}
            />
          )}
          
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">External Controls</h3>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setActiveTab('tab1')}
              >
                Activate Tab 1
              </button>
              <button 
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setActiveTab('tab2')}
              >
                Activate Tab 2
              </button>
              <button 
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setActiveTab('tab3')}
              >
                Activate Tab 3
              </button>
            </div>
            <p className="mt-2">Active Tab: {activeTab}</p>
          </div>
        </>
      ) : (
        customStatus ? (
          <CustomTabs 
            tabConfig={customTabConfig}
            defaultValue="tab1"
          />
        ) : (
          <Tabs 
            tabConfig={standardTabConfig}
            defaultValue="tab1"
          />
        )
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <InteractiveTabs />,
  parameters: {
    docs: {
      description: {
        story: 'Default Tabs component with uncontrolled behavior. The tabs can be clicked to switch between content panels.'
      }
    }
  }
}

export const WithStatusIndicators: Story = {
  render: () => <InteractiveTabs withStatus={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Tabs with status indicators. Each tab has a colored circle indicator with the default Lucide Circle component.'
      }
    }
  }
}

export const WithCustomStatusIndicators: Story = {
  render: () => <InteractiveTabs withStatus={true} customStatus={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Tabs with custom status indicators. Each tab has a colored circle indicator without any stroke or border.'
      }
    }
  }
}

export const ControlledTabs: Story = {
  render: () => <InteractiveTabs controlled={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Controlled Tabs component where the active tab is managed by external state. This example includes buttons to control the active tab from outside the component.'
      }
    }
  }
}

// Example with custom content
export const WithCustomContent: Story = {
  render: () => {
    const customTabConfig = [
      {
        key: 'dashboard',
        title: 'Dashboard',
        content: (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Dashboard Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded shadow">
                <h4 className="font-medium">Statistics</h4>
                <p className="text-gray-500">View your statistics here</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <h4 className="font-medium">Analytics</h4>
                <p className="text-gray-500">View your analytics here</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'settings',
        title: 'Settings',
        content: (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">User Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                  <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 left-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <div className="w-10 h-5 bg-blue-500 rounded-full relative">
                  <div className="absolute w-4 h-4 bg-white rounded-full top-0.5 right-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        ),
        status: true,
        statusFill: '#3B82F6', // blue
      },
      {
        key: 'profile',
        title: 'Profile',
        content: (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">User Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <h4 className="font-medium">John Doe</h4>
                <p className="text-gray-500">john.doe@example.com</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-500 text-white rounded">Edit Profile</button>
          </div>
        ),
      },
    ];
    
    return (
      <div className="w-[600px]">
        <Tabs 
          tabConfig={customTabConfig}
          defaultValue="dashboard"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Tabs with rich custom content in each tab panel. This example shows how the Tabs component can be used to create a more complex interface. The Settings tab includes a status indicator.'
      }
    }
  }
} 