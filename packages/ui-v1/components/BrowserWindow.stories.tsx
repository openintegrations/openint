import type {Meta, StoryObj} from '@storybook/react'
import {cn} from '@openint/shadcn/lib/utils'

interface BrowserWindowProps {
  children: React.ReactNode
  className?: string
  title?: string
  url?: string
  isLoading?: boolean
}

function BrowserWindow({
  children,
  className,
  title = 'Browser Window',
  url = 'https://example.com',
  isLoading = false,
}: BrowserWindowProps) {
  return (
    <div
      className={cn(
        'bg-background overflow-hidden rounded-lg border shadow-lg',
        className,
      )}>
      {/* Browser Header */}
      <div className="bg-muted/50 border-b p-2">
        <div className="flex items-center gap-2">
          {/* Traffic Lights */}
          <div className="flex gap-2 pl-2">
            <div className="h-3 w-3 rounded-full bg-gray-300" />
            <div className="h-3 w-3 rounded-full bg-gray-300" />
            <div className="h-3 w-3 rounded-full bg-gray-300" />
          </div>

          {/* URL Bar */}
          <div className="bg-background flex flex-1 items-center gap-2 rounded-md px-3 py-1.5 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              <path d="M21 3v9h-9" />
            </svg>
            <input
              type="text"
              value={url}
              readOnly
              className="text-muted-foreground w-full bg-transparent outline-none"
              // This is nice but makes this a client-component rather than a server-component
              // onClick={(e) => e.currentTarget.select()}
            />
            {isLoading && (
              <div className="ml-auto">
                <svg
                  className="text-muted-foreground h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Browser Actions */}
          <div className="flex items-center gap-1">
            <button className="hover:bg-muted rounded-md p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="hover:bg-muted rounded-md p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="relative">{children}</div>
    </div>
  )
}

const meta = {
  title: 'Components/BrowserWindow',
  component: BrowserWindow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BrowserWindow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="w-full p-8">
        <h1 className="mb-4 text-2xl font-bold">
          Welcome to the Browser Window
        </h1>
        <p className="text-muted-foreground">
          This is a simulated browser window component that can be used to
          preview web content.
        </p>
      </div>
    ),
  },
}

export const WithLoading: Story = {
  args: {
    isLoading: true,
    children: (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Loading State</h1>
        <p className="text-muted-foreground">
          The browser window shows a loading indicator in the URL bar.
        </p>
      </div>
    ),
  },
}

export const CustomURL: Story = {
  args: {
    url: 'https://openint.dev',
    children: (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Custom URL</h1>
        <p className="text-muted-foreground">
          You can customize the URL shown in the address bar.
        </p>
      </div>
    ),
  },
}

export const CustomTitle: Story = {
  args: {
    title: 'OpenInt Dashboard',
    children: (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Custom Title</h1>
        <p className="text-muted-foreground">
          The browser window title can be customized.
        </p>
      </div>
    ),
  },
}
