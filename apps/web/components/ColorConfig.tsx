'use client'

import {useTheme} from 'next-themes'
import {useEffect, useMemo, useState} from 'react'

const GS_ID = 'org_2pjCxWkWPImA1ZKNlzL2fQzzcgX'

interface ThemeColors {
  accent: string
  background: string
  border: string
  button: string
  buttonLight: string
  buttonForeground: string
  buttonHover: string
  buttonStroke: string
  buttonSecondary: string
  buttonSecondaryForeground: string
  buttonSecondaryStroke: string
  buttonSecondaryHover: string
  card: string
  cardForeground: string
  destructive: string
  destructiveForeground: string
  destructiveHover: string
  destructiveStroke: string
  foreground: string
  muted: string
  mutedForeground: string
  navbar: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  sidebar: string
  tab: string
  outlineHoverForeground: string
}

const defaultThemeColors: Partial<ThemeColors> = {
  accent: 'hsl(210, 51%, 78%)',
  background: 'hsl(0, 0%, 100%)', // #ffffff - White
  border: 'hsl(222, 23%, 87%)', // #d6d9e4 - Light Grayish Blue
  button: 'hsl(265, 100%, 57%)', // Updated from hsl(114, 89.70%, 65.90%)
  buttonLight: 'hsl(255, 90%, 96%)', // Light Purples
  buttonForeground: 'hsl(0, 0%, 100%)', // #ffffff - White
  buttonHover: 'hsl(258, 67%, 46%)', // Updated from hsl(258, 70%, 71%)
  buttonStroke: '#a884ff', // Updated from hsl(255, 90%, 66%)
  buttonSecondary: 'transparent',
  buttonSecondaryForeground: 'hsl(245, 12%, 20%)', // Same as foreground
  buttonSecondaryStroke: 'hsl(220, 25%, 86%)', // Same as border
  buttonSecondaryHover: 'hsl(0, 0%, 95%)', // Same as accent
  card: 'hsl(0, 0%, 100%)', // #ffffff - White
  cardForeground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  destructive: 'hsl(0, 100%, 50%)',
  destructiveForeground: 'hsl(220, 35%, 92%)',
  destructiveHover: 'hsl(0, 100%, 40%)',
  destructiveStroke: 'hsl(0, 100%, 65%)',
  foreground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  muted: 'hsl(0, 0%, 95%)',
  mutedForeground: 'hsl(0, 0%, 27%)',
  navbar: 'hsl(0, 0%, 100%)', // #ffffff - White
  popover: 'hsl(0, 0%, 100%)',
  popoverForeground: 'hsl(250, 12%, 20%)',
  primary: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  primaryForeground: 'hsl(222, 35%, 92%)', // #e2e6f1 - Very Light Grayish Blue
  secondary: 'hsl(0, 0%, 100%)', // #ffffff - White
  secondaryForeground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  sidebar: 'hsl(0, 0%, 100%)', // #ffffff - White
  tab: 'hsl(0, 0%, 100%)', // #ffffff - White
  outlineHoverForeground: 'hsl(0, 0%, 32%)',
}

const defaultDarkThemeColors: Partial<ThemeColors> = {
  accent: 'hsl(220, 21%, 39%)',
  background: 'hsl(0, 0, 11%)',
  border: 'hsl(0, 0%, 20%)',
  button: 'hsl(255, 90%, 66%)',
  buttonLight: 'hsl(255, 90%, 96%)',
  buttonForeground: 'hsl(0, 0%, 96.5%)',
  buttonHover: 'hsl(255, 70%, 71%)',
  buttonStroke: 'hsl(255, 45%, 51%)',
  buttonSecondary: 'transparent',
  buttonSecondaryForeground: 'hsl(0, 0%, 96.5%)', // Same as foreground
  buttonSecondaryStroke: 'hsl(0, 0%, 20%)', // Same as border
  buttonSecondaryHover: 'hsla(0, 0%, 100%, 0.097)', // Same as accent
  card: 'hsl(0, 0%, 14%)',
  cardForeground: 'hsl(0, 0%, 96.5%)',
  destructive: 'hsl(7, 68%, 53%)',
  destructiveForeground: 'hsl(220, 35%, 92%)',
  destructiveHover: 'hsl(7, 68%, 43%)',
  destructiveStroke: 'hsl(7, 68%, 63%)',
  foreground: 'hsl(0, 0%, 96.5%)',
  muted: 'hsla(0, 0%, 100%, 0.097)',
  mutedForeground: 'hsl(0, 0%, 60%)',
  navbar: 'hsl(0, 0%, 100%)',
  popover: 'hsl(0, 0%, 14%)',
  popoverForeground: 'hsl(0, 0%, 96.5%)',
  primary: 'hsl(0, 0%, 96.5%)',
  primaryForeground: 'hsl(0, 0%, 11%)',
  secondary: 'hsl(0, 0%, 14%)',
  secondaryForeground: 'hsl(0, 0%, 96.5%)',
  sidebar: 'hsl(0, 0%, 100%)',
  tab: 'hsl(0, 0%, 14%)',
  outlineHoverForeground: 'hsl(0, 0%, 85%)',
}

const defaultColorsByTheme = {
  light: defaultThemeColors,
  dark: defaultDarkThemeColors,
}

const gsThemeColors: Partial<ThemeColors> = {
  ...defaultThemeColors,
  button: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonLight: 'hsl(199, 51%, 96%)', // #e6f5ff - Light Steel Aqua
  buttonHover: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonStroke: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
}

const gsDarkThemeColors: Partial<ThemeColors> = {
  ...defaultDarkThemeColors,
  accent: 'hsl(199, 51%, 60%)', // #66ACCD
  background: 'hsl(210, 25%, 8%)', // #0F141A Dark gray
  button: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonLight: 'hsl(199, 51%, 96%)', // #e6f5ff - Light Steel Aqua
  buttonHover: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonStroke: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  tab: 'hsl(210, 25%, 8%)', // #0F141A Dark gray
}

const gsColorsByTheme = {
  light: gsThemeColors,
  dark: gsDarkThemeColors,
}

const getThemeByOrgId = (orgId: string, theme: 'light' | 'dark') => {
  switch (orgId) {
    case GS_ID:
      return gsColorsByTheme[theme]
    default:
      return defaultColorsByTheme[theme]
  }
}

export function ColorConfig({orgId}: {orgId: string}) {
  const {theme} = useTheme() as {theme: 'light' | 'dark'}
  const [themeColors, setThemeColors] = useState<Partial<ThemeColors>>(
    getThemeByOrgId(orgId, theme),
  )

  const cssSelector = useMemo(
    () => (theme === 'dark' ? '.dark' : ':root'),
    [theme],
  )

  useEffect(() => {
    setThemeColors(getThemeByOrgId(orgId, theme))
  }, [orgId, theme])

  return themeColors !== undefined ? (
    <style id="theme-colors" jsx global>{`
      ${cssSelector} {
        --accent: ${themeColors.accent};
        --background: ${themeColors.background};
        --border: ${themeColors.border};
        --button: ${themeColors.button};
        --button-light: ${themeColors.buttonLight};
        --button-foreground: ${themeColors.buttonForeground};
        --button-hover: ${themeColors.buttonHover};
        --button-stroke: ${themeColors.buttonStroke};
        --button-secondary: ${themeColors.buttonSecondary};
        --button-secondary-foreground: ${themeColors.buttonSecondaryForeground};
        --button-secondary-stroke: ${themeColors.buttonSecondaryStroke};
        --button-secondary-hover: ${themeColors.buttonSecondaryHover};
        --card: ${themeColors.card};
        --card-foreground: ${themeColors.cardForeground};
        --destructive: ${themeColors.destructive};
        --destructive-foreground: ${themeColors.destructiveForeground};
        --destructive-hover: ${themeColors.destructiveHover};
        --destructive-stroke: ${themeColors.destructiveStroke};
        --foreground: ${themeColors.foreground};
        --muted: ${themeColors.muted};
        --muted-foreground: ${themeColors.mutedForeground};
        --navbar: ${themeColors.navbar};
        --popover: ${themeColors.popover};
        --popover-foreground: ${themeColors.popoverForeground};
        --primary: ${themeColors.primary};
        --primary-foreground: ${themeColors.primaryForeground};
        --secondary: ${themeColors.secondary};
        --secondary-foreground: ${themeColors.secondaryForeground};
        --sidebar: ${themeColors.sidebar};
        --tab: ${themeColors.tab};
        --input: ${themeColors.foreground};
        --ring: ${themeColors.secondary};
        --outline-hover-foreground: ${themeColors.outlineHoverForeground};
      }
    `}</style>
  ) : null
}
