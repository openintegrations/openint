export interface AuthObject {
  openIntFilePickerMagicLink: string
  sharepoint?: Omit<SharepointConnectionDetails, 'type'>
  googleDrive?: Omit<GoogleDriveConnectionDetails, 'type'>
}

export type SharepointConnectionDetails = {
  type: 'sharepoint'
  accessToken: string
  clientId: string
}

export type GoogleDriveConnectionDetails = {
  type: 'googledrive'
  accessToken: string
}

export type ConnectionDetails =
  | SharepointConnectionDetails
  | GoogleDriveConnectionDetails

export interface FilePickerOptions {
  isOpen?: boolean
  onClose?: () => void
  onSelect?: (files: SelectedFile[]) => void
  theme?: 'light' | 'dark'
  colors?: ThemeColors
  multiselect?: boolean
  folderSelect?: boolean
}

export type SelectedFile = {
  id: string
  name: string
  type: 'file' | 'folder'
  driveId: string | null
  driveGroupId: string | null
}

export interface PickerInterface {
  open(): Promise<void>
  close(): void
}

export interface IAuthenticateCommand {
  command: string
  resource: string
  type: string
}

export interface PickerConfiguration {
  sdk: string
  entry: {
    sharePoint?: {
      siteUrl?: string
      isSiteAdmin?: boolean
    }
    oneDrive?: Record<string, never>
  }
  authentication: Record<string, never>
  messaging: {
    origin: string
    channelId: string
  }
  selection?: {
    mode: 'multiple' | 'single'
    maxCount?: number
  }
  typesAndSources?: {
    mode: 'all' | 'files' | 'folders'
    pivots?: Array<'recent' | 'shared' | 'discover'>
  }
}

export interface ThemeColors {
  accent?: string
  background?: string
  border?: string
  button?: string
  buttonLight?: string
  buttonForeground?: string
  buttonHover?: string
  buttonStroke?: string
  buttonSecondary?: string
  buttonSecondaryForeground?: string
  buttonSecondaryStroke?: string
  buttonSecondaryHover?: string
  card?: string
  cardForeground?: string
  foreground?: string
  navbar?: string
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  sidebar?: string
  tab?: string
}

export const defaultThemeColors: Partial<ThemeColors> = {
  accent: 'hsl(255, 90%, 66%)', // #8a5df6 - Bright Purple
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

export const defaultDarkThemeColors: Partial<ThemeColors> = {
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
