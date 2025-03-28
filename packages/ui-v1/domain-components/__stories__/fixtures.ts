import type {Core} from '@openint/api-v1/models'

// @rodrigo FIX ME to have server return the same type
// Also note Line 111 in ConnectorCard.tsx
export type ConnectorTemporary = Core['connector'] & {
  stage: 'alpha' | 'beta' | 'ga'
  /** This belongs on connector config not connector */
  connection_count?: number
  category?: string
  auth_type?: string
  version?: string
}

export type ConnectorConfigTemporary = Core['connector_config'] & {
  connection_count?: number
  connector: ConnectorTemporary
}

const connectors = {
  salesforce: {
    name: 'salesforce',
    display_name: 'Salesforce',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
    stage: 'ga' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  hubspot: {
    name: 'hubspot',
    display_name: 'HubSpot',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/168_Hubspot_logo_logos-512.png',
    stage: 'beta' as const,
    platforms: ['web', 'mobile'],
  },
  notion: {
    name: 'notion',
    display_name: 'Notion',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
    stage: 'alpha' as const,
    platforms: ['web'],
  },
  'google-drive': {
    name: 'google-drive',
    display_name: 'Google Drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    stage: 'ga' as const,
    platforms: ['web', 'desktop'],
  },
  dropbox: {
    name: 'dropbox',
    display_name: 'Dropbox',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/84_Dropbox_logo_logos-512.png',
    stage: 'beta' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  slack: {
    name: 'slack',
    display_name: 'Slack',
    logo_url:
      'https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Slack_colored_svg-512.png',
    stage: 'ga' as const,
    platforms: ['web', 'mobile', 'desktop'],
  },
  jira: {
    name: 'jira',
    display_name: 'Jira',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/184_Jira_logo_logos-512.png',
    stage: 'alpha' as const,
    platforms: ['web', 'desktop'],
  },
  asana: {
    name: 'asana',
    display_name: 'Asana',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/27_Asana_logo_logos-512.png',
    stage: 'ga' as const,
    platforms: ['web', 'mobile'],
  },
  zoom: {
    name: 'zoom',
    display_name: 'Zoom',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/405_Zoom_logo-512.png',
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

const connectorConfigList = connectorsList.map(
  (connector): ConnectorConfigTemporary => ({
    id: `ccfg_${connector.name}_123`,
    connector,
    connection_count: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: connector.name,
    display_name: null,
    disabled: null,
  }),
)

export const FIXTURES = {
  connectors,
  connectorsList,
  connectorConfigList,
}
