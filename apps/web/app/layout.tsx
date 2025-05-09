import '@openint/ui-v1/global.css'

import type {Metadata} from 'next'

import {ThemeProvider} from '@openint/ui-v1/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'OpenInt',
  description: 'OpenInt platform',
  icons: {
    icon: '/_assets/logo-favicon.svg',
    apple: '/_assets/logo-favicon.svg',
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    // Needed for the theme provider to work, not sure why
    // https://ui.shadcn.com/docs/dark-mode/next
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body>
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
