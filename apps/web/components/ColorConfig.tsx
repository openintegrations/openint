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
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
}

const defaultThemeColors: Partial<ThemeColors> = {
  background: '0 0% 100%',
  border: '214.3 31.8% 91.4%',
  button: '#8a5df6',
  buttonForeground: '#ffffff',
  buttonHover: '#a082e9',
  buttonStroke: '#6947bb',
  buttonSecondary: '#ffffff',
  buttonSecondaryForeground: '#000000',
  buttonSecondaryStroke: '#e6e6e6',
  buttonSecondaryHover: '#efefef',
  card: '0 100% 50%',
  cardForeground: '192 5.32% 31.57%',
  foreground: '192 5.32% 31.57%',
  primary: '222.2 47.4% 11.2%',
  primaryForeground: '210 40% 98%',
  secondary: '210 40% 96.1%',
  secondaryForeground: '222.2 47.4% 11.2%',
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
        --primary: ${themeColors.primary};
        --primary-foreground: ${themeColors.primaryForeground};
        --secondary: ${themeColors.secondary};
        --secondary-foreground: ${themeColors.secondaryForeground};
        --input: ${themeColors.foreground};
        --ring: ${themeColors.secondary};
      }
    `}</style>
  )
}
