import type {Core} from '@openint/api-v1/models'

// @rodrigo FIX ME to have server return the same type
// Also note Line 111 in ConnectorCard.tsx
export type ConnectorTemporary = Core['connector'] & {
  stage: 'alpha' | 'beta' | 'ga'
  connection_count?: number
  category?: string
  auth_type?: string
  version?: string
}

const connectors = {
  salesforce: {
    name: 'salesforce',
    stage: 'ga' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  hubspot: {
    name: 'hubspot',
    stage: 'beta' as const,
    platforms: ['web', 'mobile'],
  },
  notion: {
    name: 'notion',
    stage: 'alpha' as const,
    platforms: ['web'],
  },
  'google-drive': {
    name: 'google-drive',
    stage: 'ga' as const,
    platforms: ['web', 'desktop'],
  },
  dropbox: {
    name: 'dropbox',
    stage: 'beta' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  slack: {
    name: 'slack',
    stage: 'ga' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  jira: {
    name: 'jira',
    stage: 'alpha' as const,
    platforms: ['web', 'desktop'],
  },
  asana: {
    name: 'asana',
    stage: 'ga' as const,
    platforms: ['web', 'mobile'],
  },
  zoom: {
    name: 'zoom',
    stage: 'beta' as const,
    platforms: ['web', 'desktop', 'mobile'],
  },
} satisfies Record<string, ConnectorTemporary>

/** @deprecated. Should use connectors list above */
const connectorsList = [
  {
    name: 'salesforce',
    display_name: 'Salesforce',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as ('web' | 'mobile' | 'desktop')[],
    category: 'CRM',
    auth_type: 'oauth2',
    version: 'V2',
  },
  {
    name: 'google-drive',
    display_name: 'Google Drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as ('web' | 'mobile' | 'desktop')[],
    category: 'File Storage',
    auth_type: 'oauth2',
    version: 'V3',
  },
  {
    name: 'google-drive-beta',
    display_name: 'Google Drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile'] as ('web' | 'mobile' | 'desktop')[],
    category: 'File Storage',
    auth_type: 'oauth2',
    version: 'V2',
  },
  {
    name: 'plaid',
    display_name: 'Plaid',
    logo_url:
      'https://cdn.icon-icons.com/icons2/2699/PNG/512/plaid_logo_icon_168102.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    category: 'Banking',
    auth_type: 'aggregator',
    version: 'V2',
  },
  {
    name: 'cal-com',
    display_name: 'Cal.com',
    logo_url: 'https://cal.com/android-chrome-512x512.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    category: 'Scheduling',
    auth_type: 'apikey',
    version: 'V1',
  },
] satisfies ConnectorTemporary[]

export const FIXTURES = {
  connectors,
  connectorsList,
}
