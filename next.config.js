const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    debug: false,
  },
  images: {
    domains: [
      'd3hjr60szea5ud.cloudfront.net',
      'app.ideamarket.io',
      'raw.githubusercontent.com',
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
    ]
  },
})
