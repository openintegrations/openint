import type {
  ConnectionExpanded,
  ConnectorConfig,
  Core,
} from '@openint/api-v1/models'

export type ConnectorConfigTemporary = ConnectorConfig<
  'connector' | 'connection_count'
>

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
} satisfies Record<string, Core['connector']>

const integrations = {
  hubspot: {
    id: 'int_hubspot_123',
    name: 'hubspot',
    connector_name: 'hubspot',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/168_Hubspot_logo_logos-512.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    standard: [{}],
    external: [{}],
  },
  notion: {
    id: 'int_notion_123',
    name: 'notion',
    connector_name: 'notion',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    standard: [{}],
    external: [{}],
  },
  'google-drive': {
    id: 'int_google-drive_123',
    name: 'google-drive',
    connector_name: 'google-drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    standard: [{}],
    external: [{}],
  },
} satisfies Record<string, Core['integration_select']>

const connections = {
  'salesforce-basic': {
    id: 'conn_salesforce_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_salesforce_123',
    connector: connectors.salesforce,
    connector_name: 'salesforce',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Salesforce Connection',
  },
  'salesforce-with-integration': {
    id: 'conn_salesforce_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_salesforce_123',
    connector: connectors.salesforce,
    connector_name: 'salesforce',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: 'int_salesforce_123',
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Salesforce Connection with Integration',
  },
  'salesforce-without-logo': {
    id: 'conn_salesforce_123',
    connector_config_id: 'ccfg_salesforce_123',
    connector: {
      ...connectors.salesforce,
      logo_url: undefined,
    },
    connector_name: 'salesforce',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Salesforce No Logo',
  },
  'hubspot-basic': {
    id: 'conn_hubspot_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_hubspot_123',
    connector: connectors.hubspot,
    connector_name: 'hubspot',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'HubSpot Connection',
  },
  'hubspot-with-integration': {
    id: 'conn_hubspot_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_hubspot_123',
    connector: connectors.hubspot,
    connector_name: 'hubspot',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: 'int_hubspot_123',
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'HubSpot Connection with Integration',
  },
  'hubspot-without-logo': {
    id: 'conn_hubspot_123',
    connector_config_id: 'ccfg_hubspot_123',
    connector: {
      ...connectors.hubspot,
      logo_url: undefined,
    },
    connector_name: 'hubspot',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'HubSpot No Logo',
  },
  'notion-basic': {
    id: 'conn_notion_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_notion_123',
    connector: connectors.notion,
    connector_name: 'notion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Notion Connection',
  },
  'notion-with-integration': {
    id: 'conn_notion_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_notion_123',
    connector: connectors.notion,
    connector_name: 'notion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: 'int_notion_123',
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Notion Connection with Integration',
  },
  'notion-without-logo': {
    id: 'conn_notion_123',
    connector_config_id: 'ccfg_notion_123',
    connector: {
      ...connectors.notion,
      logo_url: undefined,
    },
    connector_name: 'notion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Notion No Logo',
  },
  'google-drive-basic': {
    id: 'conn_google-drive_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_google-drive_123',
    connector: connectors['google-drive'],
    connector_name: 'googledrive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Google Drive Connection',
  },
  'google-drive-with-integration': {
    id: 'conn_google-drive_01HN4QZXG7YPBR8MXQT4KBWQ5N',
    connector_config_id: 'ccfg_google-drive_123',
    connector: connectors['google-drive'],
    connector_name: 'googledrive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: 'int_google-drive_123',
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Google Drive Connection with Integration',
  },
  'google-drive-without-logo': {
    id: 'conn_gdrive_123',
    connector_config_id: 'ccfg_google-drive-beta_123',
    connector: {
      ...connectors['google-drive'],
      logo_url: undefined,
    },
    connector_name: 'googledrive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Google Drive No Logo',
  },
  'no-integration-no-connector': {
    id: 'conn_custom_connector_123',
    connector_config_id: 'ccfg_custom_connector_123',
    connector_name: 'custom_connector',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_id: 'cust_123',
    integration_id: null,
    metadata: {},
    settings: {},
    disabled: false,
    display_name: 'Custom Connector',
  },
} satisfies Record<string, ConnectionExpanded>

const connectorConfigs = {
  salesforce: {
    id: 'ccfg_salesforce_123',
    connector: connectors.salesforce,
    connection_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: 'salesforce',
    display_name: 'Salesforce Connector',
    disabled: false,
    metadata: {},
  },
  hubspot: {
    id: 'ccfg_hubspot_123',
    connector: connectors.hubspot,
    connection_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: 'hubspot',
    display_name: 'HubSpot Connector',
    disabled: false,
    metadata: {},
  },
  notion: {
    id: 'ccfg_notion_123',
    connector: connectors.notion,
    connection_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: 'notion',
    display_name: 'Notion Connector',
    disabled: false,
    metadata: {},
  },
  'google-drive': {
    id: 'ccfg_google-drive_123',
    connector: connectors['google-drive'],
    connection_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {},
    org_id: 'org_123',
    connector_name: 'googledrive',
    display_name: 'Google Drive Connector',
    disabled: false,
    metadata: {},
  },
} satisfies Record<string, ConnectorConfig<'connector' | 'connection_count'>>

export const FIXTURES = {
  connectors,
  connectorConfigs,
  integrations,
  connections,
  connectorsList: Object.values(connectors),
  connectorConfigList: Object.values(connectorConfigs),
}
