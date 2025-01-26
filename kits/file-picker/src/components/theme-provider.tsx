'use client'

import {ThemeProvider as NextThemesProvider} from 'next-themes'

export function ThemeProvider({children, ...props}: any) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
