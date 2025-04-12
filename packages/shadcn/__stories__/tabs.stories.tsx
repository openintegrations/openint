import type {Meta, StoryObj} from '@storybook/react'

import {Tabs, TabsContent, TabsList, TabsTrigger} from '../ui/tabs'

const meta = {
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {control: 'text'},
    className: {control: 'text'},
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

// Basic example
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account settings and preferences.
        </p>
      </TabsContent>
      <TabsContent value="password" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Change your password here. After saving, you&apos;ll be logged out.
        </p>
      </TabsContent>
      <TabsContent value="settings" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your notification and display settings.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// With icons
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="profile">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </TabsTrigger>
        <TabsTrigger value="dashboard">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile information and preferences.
        </p>
      </TabsContent>
      <TabsContent value="dashboard" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Dashboard</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          View your dashboard and analytics.
        </p>
      </TabsContent>
      <TabsContent value="settings" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your application settings and preferences.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// Disabled tab
export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="cancelled" disabled>
          Cancelled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Active Tasks</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          View all your active tasks here.
        </p>
      </TabsContent>
      <TabsContent value="pending" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Pending Tasks</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          View all your pending tasks here.
        </p>
      </TabsContent>
      <TabsContent value="completed" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Completed Tasks</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          View all your completed tasks here.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList className="bg-muted/20 grid w-full grid-cols-3">
        <TabsTrigger
          value="tab1"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Tab 1
        </TabsTrigger>
        <TabsTrigger
          value="tab2"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Tab 2
        </TabsTrigger>
        <TabsTrigger
          value="tab3"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Tab 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Tab 1 Content</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          This is the content for tab 1.
        </p>
      </TabsContent>
      <TabsContent value="tab2" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Tab 2 Content</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          This is the content for tab 2.
        </p>
      </TabsContent>
      <TabsContent value="tab3" className="mt-2 rounded-md border p-4">
        <h3 className="text-lg font-medium">Tab 3 Content</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          This is the content for tab 3.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

// Vertical tabs
export const VerticalTabs: Story = {
  render: () => (
    <Tabs
      defaultValue="music"
      orientation="vertical"
      className="flex w-[600px]">
      <TabsList className="flex h-auto w-[200px] flex-col">
        <TabsTrigger value="music" className="justify-start">
          Music
        </TabsTrigger>
        <TabsTrigger value="videos" className="justify-start">
          Videos
        </TabsTrigger>
        <TabsTrigger value="photos" className="justify-start">
          Photos
        </TabsTrigger>
      </TabsList>
      <div className="ml-4 flex-1">
        <TabsContent value="music" className="rounded-md border p-4">
          <h3 className="text-lg font-medium">Music</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse and manage your music collection.
          </p>
        </TabsContent>
        <TabsContent value="videos" className="rounded-md border p-4">
          <h3 className="text-lg font-medium">Videos</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse and manage your video collection.
          </p>
        </TabsContent>
        <TabsContent value="photos" className="rounded-md border p-4">
          <h3 className="text-lg font-medium">Photos</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse and manage your photo collection.
          </p>
        </TabsContent>
      </div>
    </Tabs>
  ),
}
