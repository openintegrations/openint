import path from 'node:path'
import type {NextConfig} from 'next'

import {withSentryConfig} from '@sentry/nextjs'
// eslint-disable-next-line import-x/no-extraneous-dependencies
import webpack from 'webpack'

const isDevOrPreview =
  process.env.NODE_ENV !== 'production' ||
  process.env['VERCEL_URL']?.endsWith('openint-dev.vercel.app')

/** match all paths that are not special in next.js world */
const nonSpecialPath = '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt).*)'

const nextConfig = {
  // TODO: Figure out why this is still needed. Should automatically work
  transpilePackages: [
    // Should we generate this list from fs also?
    path.resolve(__dirname, '../../kits/cdk'),
    path.resolve(__dirname, '../../kits/connect'),
    path.resolve(__dirname, '../../packages/ui-v1'),
    path.resolve(__dirname, '../../packages/shadcn'),
    path.resolve(__dirname, '../../packages/util'),
    // ...connectorInfos.map(({dirName}) =>
    //   path.resolve(__dirname, `../../connectors/${dirName}`),
    // ),
  ],
  env: {
    NEXT_PUBLIC_PORT: process.env['PORT'] ?? '',
    NEXT_PUBLIC_NODE_ENV: process.env['NODE_ENV'],
  },
  // suppress error where 'debug' module requires 'supports-color' module dynamically
  // @see https://share.cleanshot.com/dWSLnpnS
  // experimental: {esmExternals: 'loose', typedRoutes: true},
  serverExternalPackages: ['@openint/connector-mongodb'],
  reactStrictMode: true,
  rewrites: async () => ({
    beforeFiles: [
      // Proxy metrics requests to Posthog.
      // TODO: Where is this used? and rename to _posthog to be consistent with _sentry
      {source: '/_posthog/:p*', destination: 'https://app.posthog.com/:p*'},

      // Legacy api for compat
      // api.openint.dev/v0/* -> app.openint.dev/api/v0/*
      {
        source: '/v0/:path*',
        has: [{type: 'host', value: 'api.openint.dev'}],
        destination:
          'https://openint-git-v0-openint-dev.vercel.app/api/v0/:path*',
      },
      // api.openint.dev/* -> /api/*
      {
        source: nonSpecialPath,
        has: [{type: 'host', value: 'api.openint.dev'}],
        destination: '/api/:path*',
      },
      // connect.openint.dev/* -> /connect/*
      {
        // Allow connect.openint.dev/api/* to pass through without rewrites
        source: '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt|api).*)',
        has: [{type: 'host', value: 'connect.openint.dev'}],
        destination: '/connect/:path*',
      },
      // console.openint.dev/* -> /console/*
      {
        // Allow console.openint.dev/api/* to pass through without rewrites
        source: '/:path((?!_next|favicon.ico|sitemap.xml|robots.txt|api).*)',
        has: [{type: 'host', value: 'console.openint.dev'}],
        destination: '/console/:path*',
      },
      // uncomment this for local testing
      // {
      //   source: '/:path*',
      //   has: [{type: 'host', value: 'local.openint.dev'}],
      //   // Update this to test any routes
      //   // destination: '/connect/:path*',
      //   destination: 'https://docs.openint.dev/:path*',
      // },
    ],
    afterFiles: [],
    fallback: [],
  }),
  redirects: async () => [
    {
      source: '/storybook/:branch*',
      destination: 'https://:branch*--67cafc438c6d3b09671849dd.chromatic.com',
      permanent: false,
    },
    {
      source: '/chromatic/:branch*',
      destination:
        'https://www.chromatic.com/library?appId=67cafc438c6d3b09671849dd&branch=:branch*',
      permanent: false,
    },
    {
      source: '/preview/:branch*',
      destination: 'https://v1-git-:branch*-openint-dev.vercel.app',
      permanent: false,
    },
    // clerk expects these routes to be present in their UI and we have them inside the dashboard
    {source: '/sign-in', destination: '/console/sign-in', permanent: false},
    {source: '/sign-up', destination: '/console/sign-up', permanent: false},
    {source: '/sign-out', destination: '/console/sign-out', permanent: false},
  ],
  typescript: {ignoreBuildErrors: true},
  eslint: {ignoreDuringBuilds: true},

  // MARK: - Wtrubo pack and webpack configs...
  experimental: {
    // Not compatible with turbopack for now...
    typedRoutes: process.env['TYPED_ROUTES'] === 'true',
    typedEnv: true,
    turbo: {
      // Define rules for file transformations (similar to webpack loaders)
      rules: {
        // For .node files
        '*.node': {loaders: ['node-loader']},
      },
    },
    // TODO: Turn it on soon as we have a chance
    // reactCompiler: true
  },
  webpack: (config) => {
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false
    config.module.rules.push({
      test: /\.node$/,
      use: [{loader: 'node-loader'}],
    })
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
  // MARK: -
  images: {
    remotePatterns: [
      {hostname: 'yodlee-1.hs.llnwd.net'},
      {hostname: 'merge-api-production.s3.amazonaws.com'},
      {hostname: 'img.clerk.com'},
      {hostname: 'images.clerk.dev'},
    ],
  },

  productionBrowserSourceMaps: true, // Let's see if this helps with Sentry... We are OSS anyways so doesn't matter too much if source code is "leaked" to client
  // eslint-disable-next-line @typescript-eslint/require-await
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
        isDevOrPreview
          ? [
              {
                key: 'Cross-Origin-Embedder-Policy',
                value: 'unsafe-none',
              },
            ]
          : [],
      ),
    },
    {
      source: '/:path*',
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
      ],
    },
  ],
} satisfies NextConfig

export default withSentryConfig(nextConfig, {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  // setCommits: {auto: true},
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env['SENTRY_ORG'],
  project: process.env['SENTRY_ORG'],

  // Only print logs for uploading source maps in CI
  silent: !process.env['CI'],

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: '/_sentry',
  // tunnelRoute: "/monitoring",

  tunnelRoute: '/_sentry',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
})
