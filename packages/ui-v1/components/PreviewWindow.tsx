import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui'

interface PreviewProps {
  children: React.ReactNode
  className?: string
  url?: string
  isLoading?: boolean
}

export function BrowserWindow({
  children,
  className,
  url = 'https://example.com',
  isLoading = false,
}: PreviewProps) {
  return (
    <div
      className={cn(
        'bg-background w-full overflow-hidden rounded-lg border shadow-lg',
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

export function MobileScreen({
  children,
  className,
  url = 'https://example.com',
  isLoading = false,
}: PreviewProps) {
  return (
    <div
      className={cn(
        'bg-background relative overflow-hidden rounded-[3rem] border-8 border-gray-900 shadow-lg',
        'h-[852px] w-[393px]', // iPhone 14 Pro dimensions
        className,
      )}>
      {/* Status Bar */}
      <div className="bg-background flex items-center justify-between px-6 py-3 text-sm">
        <div className="font-medium">9:41</div>
        {/* Dynamic Island */}
        <div className="absolute left-1/2 h-6 w-32 -translate-x-1/2 rounded-full bg-black transition-all duration-300 hover:scale-105" />
        <div className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.75C13.1 21.75 14 20.85 14 19.75V4.75C14 3.65 13.1 2.75 12 2.75C10.9 2.75 10 3.65 10 4.75V19.75C10 20.85 10.9 21.75 12 21.75ZM16.5 12.75V19.75C16.5 20.85 17.4 21.75 18.5 21.75C19.6 21.75 20.5 20.85 20.5 19.75V12.75C20.5 11.65 19.6 10.75 18.5 10.75C17.4 10.75 16.5 11.65 16.5 12.75ZM3.5 19.75C3.5 20.85 4.4 21.75 5.5 21.75C6.6 21.75 7.5 20.85 7.5 19.75V15.75C7.5 14.65 6.6 13.75 5.5 13.75C4.4 13.75 3.5 14.65 3.5 15.75V19.75Z" />
          </svg>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" />
            <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" />
          </svg>
          <div>100%</div>
        </div>
      </div>

      {/* URL Bar */}
      <div className="bg-muted/50 px-4 py-2">
        <div className="bg-background flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
          <span className="text-muted-foreground flex-1 truncate text-xs">
            {url}
          </span>
          {isLoading && (
            <div className="ml-auto">
              <svg
                className="text-muted-foreground h-3 w-3 animate-spin"
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
      </div>

      {/* Content */}
      <div className="h-full overflow-auto">{children}</div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-gray-900" />
    </div>
  )
}

export function TabletScreen({
  children,
  className,
  url = 'https://example.com',
  isLoading = false,
}: PreviewProps) {
  return (
    <div
      className={cn(
        'bg-background overflow-hidden rounded-[2rem] border-[12px] border-gray-900 shadow-lg',
        'h-[1180px] w-[820px]', // iPad Air dimensions
        className,
      )}>
      {/* Status Bar */}
      <div className="bg-background flex h-8 items-center justify-between px-6">
        <div className="text-sm font-medium">9:41</div>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground">
            <path d="M6 18h8" />
            <path d="M3 6h18" />
            <path d="M3 12h18" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground">
            <path d="M18 8c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 7 6 13 6 13s6-6 6-13z" />
            <circle cx="12" cy="8" r="2" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground">
            <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
          </svg>
          <div className="text-sm font-medium">100%</div>
        </div>
      </div>

      {/* URL Bar */}
      <div className="bg-muted/50 px-6 py-2">
        <div className="bg-background flex items-center gap-2 rounded-xl px-4 py-2 text-base">
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
          <span className="text-muted-foreground flex-1 truncate">{url}</span>
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
      </div>

      {/* Content */}
      <div className="h-full overflow-auto">{children}</div>
    </div>
  )
}

interface PreviewWindowProps extends PreviewProps {
  defaultView?: 'browser' | 'tablet' | 'mobile'
}

export function PreviewWindow({
  children,
  className,
  url = 'https://example.com',
  isLoading = false,
  defaultView = 'browser',
}: PreviewWindowProps) {
  const [view, setView] = React.useState<'browser' | 'tablet' | 'mobile'>(
    defaultView,
  )

  return (
    <Tabs
      value={view}
      className={className}
      onValueChange={(value) =>
        setView(value as 'browser' | 'tablet' | 'mobile')
      }>
      <div className="flex justify-center">
        <TabsList>
          <TabsTrigger value="browser">Browser</TabsTrigger>
          <TabsTrigger value="tablet">Tablet</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>
      </div>

      {/* Preview Container */}

      <TabsContent value="browser" className="mt-0 flex justify-center">
        <BrowserWindow url={url} isLoading={isLoading}>
          {children}
        </BrowserWindow>
      </TabsContent>
      <TabsContent value="mobile" className="mt-0 flex justify-center">
        <MobileScreen url={url} isLoading={isLoading}>
          {children}
        </MobileScreen>
      </TabsContent>
      <TabsContent value="tablet" className="mt-0 flex justify-center">
        <TabletScreen url={url} isLoading={isLoading}>
          {children}
        </TabletScreen>
      </TabsContent>
    </Tabs>
  )
}

// Export individual components for backward compatibility
PreviewWindow.BrowserWindow = BrowserWindow
PreviewWindow.MobileScreen = MobileScreen
PreviewWindow.TabletScreen = TabletScreen
