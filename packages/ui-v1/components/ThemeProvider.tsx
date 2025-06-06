'use client'

import {Button} from '@openint/shadcn/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@openint/shadcn/ui/dropdown-menu'
import {Moon, Sun} from 'lucide-react'
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes'
import React from 'react'

/**
 * Wrapper around NextThemesProvider to ensure that the theme
 * provider is always rendered on the client
 **/
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

type ResolvedTheme = 'light' | 'dark'
type Theme = ResolvedTheme | 'system'

export function useTheme() {
  const nextTheme = useNextTheme()
  const isDark = nextTheme.resolvedTheme === 'dark'

  return React.useMemo(
    () => ({
      ...nextTheme,
      isDark,
      theme: nextTheme.theme as Theme | undefined,
      resolvedTheme: nextTheme.resolvedTheme as ResolvedTheme | undefined,
      setTheme: nextTheme.setTheme as (theme: Theme) => void,
      // also themes, forcedTheme props, not sure how they work though.
    }),
    [nextTheme, isDark],
  )
}

export function ThemeButton() {
  const {setTheme} = useTheme()
  // uncomment to debug
  // ;(window as any).setTheme = setTheme
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
