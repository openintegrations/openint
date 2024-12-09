'use client'

import {useState} from 'react'

const GS_ID = 'org_2pjCxWkWPImA1ZKNlzL2fQzzcgX'

interface ThemeColors {
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

const gsThemeColors: Partial<ThemeColors> = {
  ...defaultThemeColors,
  button: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonLight: 'hsl(199, 51%, 96%)', // #e6f5ff - Light Steel Aqua
  buttonHover: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
  buttonStroke: 'hsl(199, 51%, 60%)', // #67AECD - Steel Aqua
}

const getThemeByOrgId = (orgId: string) => {
  switch (orgId) {
    case GS_ID:
      return gsThemeColors
    default:
      return defaultThemeColors
  }
}

export function ColorConfig({orgId}: {orgId: string}) {
  const [themeColors] = useState<Partial<ThemeColors>>(getThemeByOrgId(orgId))
  // TODO: Fetch color config by client if required and update themeColors state.

  return (
    <style id="theme-colors" jsx global>{`
      :root {
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
  )
}
