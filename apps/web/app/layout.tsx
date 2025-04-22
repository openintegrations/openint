import '@openint/ui-v1/global.css'

import {ThemeProvider} from '@openint/ui-v1/components/ThemeProvider'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    // Needed for the theme provider to work, not sure why
    // https://ui.shadcn.com/docs/dark-mode/next
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
