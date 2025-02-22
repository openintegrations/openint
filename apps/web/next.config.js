const path = require('node:path')
const webpack = require('webpack')
const {withSentryConfig} = require('@sentry/nextjs')

const connectorInfos = require('../app-config/connectors/meta')

const isDevOrStaging =
  process.env.NODE_ENV !== 'production' ||
  process.env['VERCEL_URL'] == 'openint-git-main-openint-dev.vercel.app'
/**
 * Meta: change from `@type` to @satisfies once ts 5.0 is out
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // TODO: Figure out why this is still needed. Does not appear to be needed in byos anymore...
  transpilePackages: [
    path.resolve(__dirname, '../app-config'),
    // Should we generate this list from fs also?
    path.resolve(__dirname, '../../kits/cdk'),
    path.resolve(__dirname, '../../kits/connect'),
    path.resolve(__dirname, '../../packages/engine-backend'),
    path.resolve(__dirname, '../../packages/engine-frontend'),
    path.resolve(__dirname, '../../packages/ui'),
    path.resolve(__dirname, '../../packages/util'),
    ...connectorInfos.map(({dirName}) =>
      path.resolve(__dirname, `../../connectors/${dirName}`),
    ),
  ],
  env: {
    NEXT_PUBLIC_PORT: process.env['PORT'] ?? '',
    NEXT_PUBLIC_NODE_ENV: process.env['NODE_ENV'],
  },
  // suppress error where 'debug' module requires 'supports-color' module dynamically
  // @see https://share.cleanshot.com/dWSLnpnS
  // experimental: {esmExternals: 'loose', typedRoutes: true},
  experimental: {
    serverComponentsExternalPackages: ['@openint/connector-mongodb'],
  },
  reactStrictMode: true,
  rewrites: async () => ({
    beforeFiles: [
      // Proxy metrics requests to Posthog.
      // TODO: Where is this used? and rename to _posthog to be consistent with _sentry
      {source: '/_posthog/:p*', destination: 'https://app.posthog.com/:p*'},
    ],
    afterFiles: [],
    fallback: [],
  }),
  redirects: async () => [
    {
      source: '/docs/:p*',
      destination: 'https://openint.docs.buildwithfern.com/:p*',
      permanent: false,
    },
    {
      source: '/api/v0/verticals/:p*',
      destination: '/api/v0/unified/:p*',
      permanent: false,
    },
    {source: '/', destination: '/dashboard', permanent: false},
  ],
  swcMinify: true,
  typescript: {ignoreBuildErrors: true},
  eslint: {ignoreDuringBuilds: true},
  webpack: (config) => {
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false
    config.module.rules.push({
      test: /\.node$/,
      use: [{loader: 'node-loader'}],
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      handlebars: 'handlebars/dist/handlebars.js',
    }
    config.resolve.fallback = {
      fs: false,
      child_process: false, // Reference: https://stackoverflow.com/questions/54459442/module-not-found-error-cant-resolve-child-process-how-to-fix
      // For mongodb, Refs: https://stackoverflow.com/questions/54275069/module-not-found-error-cant-resolve-net-in-node-modules-stompjs-lib
      tls: false,
      net: false,
      dns: false,
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp:
          /^(encoding|bson-ext|kerberos|@mongodb-js\/zstd|snappy|snappy\/package\.json|aws4|mongodb-client-encryption)$/,
      }),
    )
    return config
  },
  images: {
    remotePatterns: [
      {hostname: 'yodlee-1.hs.llnwd.net'},
      {hostname: 'merge-api-production.s3.amazonaws.com'},
      {hostname: 'img.clerk.com'},
      {hostname: 'images.clerk.dev'},
    ],
  },

  productionBrowserSourceMaps: true, // Let's see if this helps with Sentry... We are OSS anyways so doesn't matter too much if source code is "leaked" to client
  headers: async () => [
    {
      source: '/',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*', // Allow any origin
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups', // Allows popups to maintain opener relationship
        },
      ].concat(
        isDevOrStaging
          ? [
              {
                key: 'Cross-Origin-Embedder-Policy',
                value: 'unsafe-none',
              },
            ]
          : [],
      ),
    },
  ],
}

module.exports = nextConfig

/**
 * @type {import('next').NextConfig}
 */
module.exports = withSentryConfig(
  {
    ...nextConfig,
    sentry: {
      // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
      // for client-side builds. (This will be the default starting in
      // `@sentry/nextjs` version 8.0.0.) See
      // https://webpack.js.org/configuration/devtool/ and
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
      // for more information.
      hideSourceMaps: true,
      tunnelRoute: '/_sentry',
    },
  },
  {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    // setCommits: {auto: true},
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_ORG,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
)
