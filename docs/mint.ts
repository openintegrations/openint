import apiPages from './unified-apis/index.json'
import openSDKPages from './open-sdks/index.json'

const mintConfig: MintConfig = {
  name: 'OpenInt',
  openapi:
    'https://raw.githubusercontent.com/openintegrations/openint/main/kits/sdk/openapi.json',
  logo: {
    light: '/images/logo/openint-logo.png',
    dark: '/images/logo/openint-logo-dark.svg',
  },
  favicon: '/images/logo/openint-logo.png',
  colors: {
    primary: '#0f2a3f',
    light: '#8b9cac',
    dark: '#8b9cac',
  },
  topbarLinks: [
    {
      name: 'Open API Spec',
      url: 'https://raw.githubusercontent.com/openintegrations/openint/production/kits/sdk/openapi.json',
    },
  ],
  topbarCtaButton: {
    name: 'Sign up',
    url: 'https://www.openint.dev',
  },
  anchors: [
    {
      name: 'GitHub',
      icon: 'github',
      url: 'https://github.com/openintegrations/openint',
    },
  ],
  primaryTab: {
    name: 'Guide',
  },
  tabs: [
    {
      name: 'Unified APIs',
      url: 'unified-apis',
    },
    {
      name: 'OpenSDKs',
      url: 'open-sdks',
    },
  ],
  navigation: [
    {
      group: 'Getting Started',
      pages: [
        'quickstart/quickstart',
        'quickstart/use-cases',
        'quickstart/features',
        'quickstart/integrations',
      ],
    },
    {
      group: 'Unified APIs',
      pages: apiPages,
    },
    {
      group: 'OpenSDKs',
      pages: openSDKPages,
    },
    {
      group: 'Core Concepts',
      pages: ['core-concepts/connector-config', 'core-concepts/magic-link'],
    },
    {
      group: 'Community',
      pages: ['community/join-our-slack', 'community/attribution'],
    }
  ],
  backgroundImage: '/images/background.png',
  footerSocials: {
    github: 'https://github.com/openintegrations/openint',
    twitter: 'https://twitter.com/openintdev',
  },
  analytics: {
    posthog: {
      apiKey: 'phc_30EStnJPoshPRjyPvxEe8gYP85AaacFPMYHsiPddpRX',
    },
  },
}

export interface MintConfig {
  name?: string
  openapi?: string
  logo?: {
    light?: string
    dark?: string
  }
  favicon?: string
  colors?: {
    primary?: string
    light?: string
    dark?: string
  }
  topbarLinks?: Array<{
    name?: string
    url?: string
  }>
  primaryTab?: {
    name?: string
  }
  tabs?: Array<{
    name?: string
    url?: string
  }>
  topbarCtaButton?: {
    name?: string
    url?: string
  }
  anchors?: Array<{
    name?: string
    icon?: string
    url?: string
  }>

  navigation: NavigationGroup[]
  backgroundImage?: string
  footerSocials?: {
    github?: string
    discord?: string
    twitter?: string
  }
  analytics?: {
    posthog?: {
      apiKey?: string
    }
  }
  [key: string]: unknown
}

interface NavigationGroup {
  group: string
  pages: Array<string | NavigationGroup>
}

export default mintConfig

if (require.main === module) {
  const outPath = process.argv[2]
  if (outPath) {
    console.log(
      `[${new Date().toISOString()}] Writing mint config to ${outPath}`,
    )
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void import('node:fs').then((fs) =>
      fs.writeFileSync(outPath, JSON.stringify(mintConfig, null, 2)),
    )
  } else {
    console.log(JSON.stringify(mintConfig))
  }
}
