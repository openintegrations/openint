import type {Core} from '@openint/api-v1/models'

// @rodrigo FIX ME to have server return the same type
export type ConnectorTemporary = Core['connector'] & {
  stage: 'alpha' | 'beta' | 'ga'
  connection_count?: number
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

export const FIXTURES = {
  connectors,
}
