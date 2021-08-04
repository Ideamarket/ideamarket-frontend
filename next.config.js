const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    dest: 'public',
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
