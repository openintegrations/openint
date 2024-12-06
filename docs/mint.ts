import apiPages from './api-reference/index.json'

const mintConfig: MintConfig = {
  name: 'OpenInt',
  openapi:
    'https://raw.githubusercontent.com/openintegrations/openint/main/kits/sdk/openapi.json',
  logo: {
    light: '/images/logo/openint-logo.png',
    dark: '/images/logo/openint-logo-dark.webp',
  },
  favicon: '/images/logo/openint-logo.png',
  colors: {
    primary: '#0f2a3f',
    light: '#8b9cac',
    dark: '#8b9cac',
  },
  topbarLinks: [
    {
      name: 'Contact us',
      url: 'mailto:support@openint.dev',
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
  tabs: [
    {
      name: 'API References',
      url: 'api-reference',
    },
    {
      name: 'OpenAPI.json',
      url: 'https://raw.githubusercontent.com/openintegrations/openint/main/kits/sdk/openapi.json',
    },
  ],
  navigation: [
    {
      group: 'API Reference',
      pages: apiPages,
    },
    {
      group: 'Guidance',
      pages: [
        'guidance/quickstart',
        'guidance/integrations',
      ],
    },
    {
      group: 'Core Concepts',
      pages: [
        'core-concepts/connector-config',
        'core-concepts/magic-link',
      ],
    },
    {
      group: 'Community',
      pages: [
        'community/join-our-slack',
      ],
    },
    {
      group: 'Support',
      pages: [
        'support/contact-us',
      ],
    },
  ],
  backgroundImage: '/images/background.png',
  footerSocials: {
    github: 'https://github.com/openintegrations/openint',
    discord: 'https://discord.gg/gTMch6Gn2u',
    twitter: 'https://twitter.com/use_venice',
  },
  analytics: {
    posthog: {
      apiKey: 'phc_T3BM4neZzi3z2ruDiN0pYpGHIYjd5AjZw0rSkhzAKSo',
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
