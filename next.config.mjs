import withPWA from 'next-pwa'
import { withSentryConfig } from '@sentry/nextjs'

const SentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
}

const moduleExports = withPWA({
  outputFileTracing: false,
  publicRuntimeConfig: {
    MIX_PANEL_KEY: process.env.MIX_PANEL_KEY,
  },
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest.json$/]
  },
  images: {
    domains: [
      'd3hjr60szea5ud.cloudfront.net',
      'app.ideamarket.io',
      'ideamarket.io',
      'raw.githubusercontent.com',
      'd37wda20o7ykez.cloudfront.net',
      'zapper.fi',
      'etherscan.io',
      'cryptologos.cc',
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'attn.to',
          },
        ],
        permanent: true,
        destination: 'https://app.ideamarket.io/:path*',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'attn.to',
          },
        ],
        permanent: true,
        destination: 'https://app.ideamarket.io',
      },
      {
        source: '/m',
        permanent: true,
        destination: '/',
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/TPTHvutjnc',
        permanent: true,
      },
    ]
  },
})

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
export default withSentryConfig(moduleExports, SentryWebpackPluginOptions)
