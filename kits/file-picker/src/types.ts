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
  accent: '#8a5df6', // hsl(255, 90%, 66%) - Bright Purple
  background: '#ffffff', // hsl(0, 0%, 100%) - White
  border: '#d6d9e4', // hsl(222, 23%, 87%) - Light Grayish Blue
  button: '#8a5df6', // hsl(255, 90%, 66%) - Bright Purple
  buttonLight: '#f5f0ff', // hsl(255, 90%, 96%) - Light Purple
  buttonForeground: '#ffffff', // hsl(0, 0%, 100%) - White
  buttonHover: '#a082e9', // hsl(258, 70%, 71%) - Light Purple
  buttonStroke: '#6947bb', // hsl(255, 90%, 66%) - Medium Purple
  buttonSecondary: '#ffffff', // hsl(0, 0%, 100%) - White
  buttonSecondaryForeground: '#000000', // hsl(0, 0%, 0%) - Black
  buttonSecondaryStroke: '#e6e6e6', // hsl(0, 0%, 90%) - Very Light Gray
  buttonSecondaryHover: '#efefef', // hsl(0, 0%, 94%) - Nearly White Gray
  card: '#ffffff', // hsl(0, 0%, 100%) - White
  cardForeground: '#2f2d3a', // hsl(245, 12%, 20%) - Dark Grayish Blue
  foreground: '#2f2d3a', // hsl(245, 12%, 20%) - Dark Grayish Blue
  navbar: '#ffffff', // hsl(0, 0%, 100%) - White
  primary: '#2f2d3a', // hsl(245, 12%, 20%) - Dark Grayish Blue
  primaryForeground: '#e2e6f1', // hsl(222, 35%, 92%) - Very Light Grayish Blue
  secondary: '#ffffff', // hsl(0, 0%, 100%) - White
  secondaryForeground: '#2f2d3a', // hsl(245, 12%, 20%) - Dark Grayish Blue
  sidebar: '#ffffff', // hsl(0, 0%, 100%) - White
  tab: '#ffffff', // hsl(0, 0%, 100%) - White
}

export const defaultDarkThemeColors: Partial<ThemeColors> = {
  accent: '#8a5df6', // hsl(255, 90%, 66%) - Bright Purple
  background: '#1c1c1c', // hsl(0, 0, 11%) - Nearly Black
  border: '#333333', // hsl(0, 0%, 20%) - Dark Gray
  button: '#8a5df6', // hsl(255, 90%, 66%) - Bright Purple
  buttonLight: '#f5f0ff', // hsl(255, 90%, 96%) - Very Light Purple
  buttonForeground: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  buttonHover: '#a082e9', // hsl(255, 70%, 71%) - Light Purple
  buttonStroke: '#7b51d3', // hsl(255, 45%, 51%) - Medium Purple
  buttonSecondary: '#242424', // hsl(0, 0%, 14%) - Very Dark Gray
  buttonSecondaryForeground: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  buttonSecondaryStroke: '#333333', // hsl(0, 0%, 20%) - Dark Gray
  buttonSecondaryHover: '#3d3d3d', // hsl(0, 0%, 24%) - Dark Gray
  card: '#242424', // hsl(0, 0%, 14%) - Very Dark Gray
  cardForeground: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  foreground: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  navbar: '#ffffff', // hsl(0, 0%, 100%) - White
  primary: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  primaryForeground: '#1c1c1c', // hsl(0, 0%, 11%) - Nearly Black
  secondary: '#242424', // hsl(0, 0%, 14%) - Very Dark Gray
  secondaryForeground: '#f6f6f6', // hsl(0, 0%, 96.5%) - Off White
  sidebar: '#ffffff', // hsl(0, 0%, 100%) - White
  tab: '#242424', // hsl(0, 0%, 14%) - Very Dark Gray
}
