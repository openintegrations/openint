'use client'

import {useTheme} from 'next-themes'
import {useEffect, useMemo, useState} from 'react'

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
  foreground: string
  navbar: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  sidebar: string
  tab: string
}

const defaultThemeColors: Partial<ThemeColors> = {
  accent: 'hsl(210, 51%, 78%)',
  background: 'hsl(0, 0%, 100%)', // #ffffff - White
  border: 'hsl(222, 23%, 87%)', // #d6d9e4 - Light Grayish Blue
  button: 'hsl(255, 90%, 66%)', // #8a5df6 - Bright Purple
  buttonLight: 'hsl(255, 90%, 96%)', // Light Purple
  buttonForeground: 'hsl(0, 0%, 100%)', // #ffffff - White
  buttonHover: 'hsl(258, 70%, 71%)', // #a082e9 - Light Purple
  buttonStroke: 'hsl(255, 90%, 66%)', // #6947bb - Medium Purple
  buttonSecondary: 'hsl(0, 0%, 100%)', // #ffffff - White
  buttonSecondaryForeground: 'hsl(0, 0%, 0%)', // #000000 - Black
  buttonSecondaryStroke: 'hsl(0, 0%, 90%)', // #e6e6e6 - Very Light Gray
  buttonSecondaryHover: 'hsl(0, 0%, 94%)', // #efefef - Nearly White Gray
  card: 'hsl(0, 0%, 100%)', // #ffffff - White
  cardForeground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  foreground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  navbar: 'hsl(0, 0%, 100%)', // #ffffff - White
  primary: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  primaryForeground: 'hsl(222, 35%, 92%)', // #e2e6f1 - Very Light Grayish Blue
  secondary: 'hsl(0, 0%, 100%)', // #ffffff - White
  secondaryForeground: 'hsl(245, 12%, 20%)', // #2f2d3a - Dark Grayish Blue
  sidebar: 'hsl(0, 0%, 100%)', // #ffffff - White
  tab: 'hsl(0, 0%, 100%)', // #ffffff - White
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
  buttonSecondary: 'hsl(0, 0%, 14%)',
  buttonSecondaryForeground: 'hsl(0, 0%, 96.5%)',
  buttonSecondaryStroke: 'hsl(0, 0%, 20%)',
  buttonSecondaryHover: 'hsl(0, 0%, 24%)',
  card: 'hsl(0, 0%, 14%)',
  cardForeground: 'hsl(0, 0%, 96.5%)',
  foreground: 'hsl(0, 0%, 96.5%)',
  navbar: 'hsl(0, 0%, 100%)',
  primary: 'hsl(0, 0%, 96.5%)',
  primaryForeground: 'hsl(0, 0%, 11%)',
  secondary: 'hsl(0, 0%, 14%)',
  secondaryForeground: 'hsl(0, 0%, 96.5%)',
  sidebar: 'hsl(0, 0%, 100%)',
  tab: 'hsl(0, 0%, 14%)',
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

const sbDarkThemeColors: Partial<ThemeColors> = {
  ...defaultDarkThemeColors,
  accent: 'hsl(0, 0%, 86%)', // #DCDCDC
  background: 'hsl(0, 0%, 4%)', // #0A0A0A
  button: 'hsl(0, 0%, 86%)', // #DCDCDC
  buttonLight: 'hsl(0, 0%, 100%)', // #FFFFFF
  buttonHover: 'hsl(0, 0%, 100%)', // #FFFFFF
  buttonStroke: 'hsl(0, 0%, 86%)', // #DCDCDC
  tab: 'hsl(0, 0%, 6%)', // #101010
}

const sbColorsByTheme = {
  light: defaultThemeColors,
  dark: sbDarkThemeColors,
}

const GS_ID = 'org_2pjCxWkWPImA1ZKNlzL2fQzzcgX'
const SB_ID = 'org_2r7BrlE3gPq74Erm7xyQoQRIV5E'

const getThemeByOrgId = (orgId: string, theme: 'light' | 'dark') => {
  switch (orgId) {
    case GS_ID:
      return gsColorsByTheme[theme]
    case SB_ID:
      return sbColorsByTheme[theme]
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
        --foreground: ${themeColors.foreground};
        --navbar: ${themeColors.navbar};
        --primary: ${themeColors.primary};
        --primary-foreground: ${themeColors.primaryForeground};
        --secondary: ${themeColors.secondary};
        --secondary-foreground: ${themeColors.secondaryForeground};
        --sidebar: ${themeColors.sidebar};
        --tab: ${themeColors.tab};
        --input: ${themeColors.foreground};
        --ring: ${themeColors.secondary};
      }
    `}</style>
  ) : null
}
