'use client'

import {useState} from 'react'

interface ThemeColors {
  background: string
  border: string
  button: string
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

export function ColorConfig() {
  const [themeColors] = useState<Partial<ThemeColors>>(defaultThemeColors)
  // TODO: Fetch color config by client if required and update themeColors state.

  return (
    <style id="theme-colors" jsx global>{`
      :root {
        --background: ${themeColors.background};
        --border: ${themeColors.border};
        --button: ${themeColors.button};
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
