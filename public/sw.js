if (!self.define) {
  const e = (e) => {
      'require' !== e && (e += '.js')
      let s = Promise.resolve()
      return (
        a[e] ||
          (s = new Promise(async (s) => {
            if ('document' in self) {
              const a = document.createElement('script')
              ;(a.src = e), document.head.appendChild(a), (a.onload = s)
            } else importScripts(e), s()
          })),
        s.then(() => {
          if (!a[e]) throw new Error(`Module ${e} didn’t register its module`)
          return a[e]
        })
      )
    },
    s = (s, a) => {
      Promise.all(s.map(e)).then((e) => a(1 === e.length ? e[0] : e))
    },
    a = { require: Promise.resolve(s) }
  self.define = (s, i, n) => {
    a[s] ||
      (a[s] = Promise.resolve().then(() => {
        let a = {}
        const r = { uri: location.origin + s.slice(1) }
        return Promise.all(
          i.map((s) => {
            switch (s) {
              case 'exports':
                return a
              case 'module':
                return r
              default:
                return e(s)
            }
          })
        ).then((e) => {
          const s = n(...e)
          return a.default || (a.default = s), a
        })
      }))
  }
}
define('./sw.js', ['./workbox-ea903bce'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/TOS.pdf', revision: '9cc50a67eec3ebe93dce3b42dd6afbb0' },
        {
          url: '/_next/static/-8JvBCmmH_FaQNJW9ICx0/_buildManifest.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/-8JvBCmmH_FaQNJW9ICx0/_ssgManifest.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/16.23965a9ff35f3600d620.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/281.d815f42d3370f997f1cc.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/55a21ef8.118feae1e25f6b8bf37d.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/563.6e1e0a9b62559b6d7be0.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/589.664c5e25bb1defa32fb6.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/602.3cb92cf81a6a7d0ceb3f.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/736-c9313942e645eb0bf539.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/878.56b4173f80ac890410f5.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/944-36dd59a4a077c148bc89.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/983.9f5dfded4478162073f2.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/984.166764675ed191a2173a.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/framework-5d05deef16fd4c089944.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/main-ae68c11529959c16c50f.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/_error-70375524866f704e88d0.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/account-cf22ccc3ec8f70d8b2a0.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/embed-67075270496d19305208.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/i/%5BmarketName%5D/%5BtokenName%5D-2cc35eed73361ea99bcf.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/iframe/%5BmarketName%5D/%5BtokenName%5D-31ccab80a7d7b5fc62a2.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/index-85db8be16e9782456d7c.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/m/%5Bmarkets%5D-184b8700e5926306266c.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/pages/r/L/%5BmarketID%5D/%5BtokenID%5D-6bd29782edf31020a07f.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/polyfills-e7a279300235e161e32a.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/chunks/webpack-1d68c4052a167ddc8aef.js',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/css/ccd69ab0ce680750b5eb.css',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/Gilroy-Bold.29e8a00a2523137109fc437c948df95a.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/Gilroy-Heavy.76014fe0badb88e06f87a85f89d3fe4a.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/Gilroy-Light.f08220ccb95672d5c17651f3f4c2e83c.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/Gilroy-Medium.3a98bbb5a6e14bbe2c27d480caf6628b.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/Gilroy-Regular.de88caa6b67b3d321011e57102caef0e.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/sf-compact-display-medium-5864711817c30.75aee41c944ba0696326ae212a9cf214.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        {
          url: '/_next/static/media/sf-compact-display-thin-58646eb43a785.613e216ff91a98bcf9c9588d20e8e47f.woff',
          revision: '-8JvBCmmH_FaQNJW9ICx0',
        },
        { url: '/arrow@3x.png', revision: '771d31fd9e0ffb58cf92c902f25885aa' },
        { url: '/coindesk.png', revision: 'b3d807fa49498e12554ec5fbc6e2217b' },
        { url: '/ethereum.png', revision: '115a0ca75d2e28a8a73bf7d32d948e5d' },
        { url: '/favicon.ico', revision: '21b739d43fcb9bbb83d8541fe4fe88fa' },
        {
          url: '/how-it-works-deposits.png',
          revision: '2dfd5874f96441c903ad5cea1530e67c',
        },
        {
          url: '/how-it-works-details.png',
          revision: '5bf562b550a619da436ea6c4387e4888',
        },
        {
          url: '/how-it-works-endowments.png',
          revision: '2f812f8d5604453d0e5e906453630eb7',
        },
        {
          url: '/how-it-works-income.png',
          revision: '6ab3433b966791dbf7b9590734a0754c',
        },
        {
          url: '/how-it-works-listings.png',
          revision: 'd362b93514c2e97c035c6947f213b27f',
        },
        {
          url: '/how-it-works-philosophy.png',
          revision: 'b112fded8aa6ddb5bd424152a3eeb912',
        },
        {
          url: '/icons/icon-192x192.png',
          revision: '43772cdd08d6f48f6edb366b959e1af6',
        },
        {
          url: '/icons/icon-256x256.png',
          revision: '003f1a4fc09c66a84dde83856694cc7f',
        },
        {
          url: '/icons/icon-384x384.png',
          revision: '095a8484e6e7c4f650e1f63892cf1b96',
        },
        {
          url: '/icons/icon-512x512.png',
          revision: '1558f144fdde4b3a28feb4e37c035967',
        },
        {
          url: '/logo-32x32.png',
          revision: 'c180b4b8e61ec0bdc61148a94e6b0b15',
        },
        { url: '/logo.png', revision: 'c180b4b8e61ec0bdc61148a94e6b0b15' },
        { url: '/manifest.json', revision: 'b02994508fd1b5014af9b82d639695da' },
        { url: '/nasdaq.png', revision: 'f51aac30ba28c016477adf2ef1656c40' },
        { url: '/og-image.jpeg', revision: '77f37fc7b90a97d1389f6c0fdb41d782' },
        { url: '/og-image.jpg', revision: '83b15db3f405aa52e1da256ebe8596d4' },
        { url: '/qs.png', revision: 'db92dc175f168e6d76fd1ac7f1cbc560' },
        {
          url: '/topbg-mobile.svg',
          revision: 'bcfe34aaa5de9433ac6caa586a57ef3b',
        },
        { url: '/topbg.svg', revision: '8e012f2fbe4b1fdef50c4805a1e3dbac' },
        {
          url: '/twitter-large-card.jpg',
          revision: 'f898d0050af2ab5fc3b7cbc3788f45a1',
        },
        { url: '/vercel.svg', revision: '23efa697ebaee8515eb63559faea2a14' },
        { url: '/vice.png', revision: '0c40f7e8dc3d0e450eb7778d024e6cd2' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: i,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 31536e3,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|mp4)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-media-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        const s = e.pathname
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        return !e.pathname.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 3600,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      'GET'
    )
})
