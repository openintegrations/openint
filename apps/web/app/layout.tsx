import '@openint/ui-v1/global.css'
import {isProduction} from '@openint/env'
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
          defaultTheme={isProduction ? 'system' : 'light'}
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
