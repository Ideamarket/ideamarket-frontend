if (!self.define) {
  const e = (e) => {
      'require' !== e && (e += '.js')
      let t = Promise.resolve()
      return (
        s[e] ||
          (t = new Promise(async (t) => {
            if ('document' in self) {
              const s = document.createElement('script')
              ;(s.src = e), document.head.appendChild(s), (s.onload = t)
            } else importScripts(e), t()
          })),
        t.then(() => {
          if (!s[e]) throw new Error(`Module ${e} didn’t register its module`)
          return s[e]
        })
      )
    },
    t = (t, s) => {
      Promise.all(t.map(e)).then((e) => s(1 === e.length ? e[0] : e))
    },
    s = { require: Promise.resolve(t) }
  self.define = (t, a, i) => {
    s[t] ||
      (s[t] = Promise.resolve().then(() => {
        let s = {}
        const n = { uri: location.origin + t.slice(1) }
        return Promise.all(
          a.map((t) => {
            switch (t) {
              case 'exports':
                return s
              case 'module':
                return n
              default:
                return e(t)
            }
          })
        ).then((e) => {
          const t = i(...e)
          return s.default || (s.default = t), s
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
          url: '/_next/static/KWkQeW8mGQFqRt2uFPBto/_buildManifest.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/KWkQeW8mGQFqRt2uFPBto/_ssgManifest.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/281.cf2b99e2688f5cf0b3b0.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/281.cf2b99e2688f5cf0b3b0.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/55a21ef8.0cb79646120c74cb0a50.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/55a21ef8.0cb79646120c74cb0a50.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/563.6e1e0a9b62559b6d7be0.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/589.7914b25856374dca09bc.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/589.7914b25856374dca09bc.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/602.3cb92cf81a6a7d0ceb3f.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/878.4ed9687f7a5cf9bee754.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/878.4ed9687f7a5cf9bee754.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/90.54ffb4e43649766ac630.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/90.54ffb4e43649766ac630.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/919-f6081efc6d36ad47785c.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/919-f6081efc6d36ad47785c.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/944-dd6088bdc6dd8fb7f6b3.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/944-dd6088bdc6dd8fb7f6b3.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/983.039a498b0883be6ffc65.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/983.039a498b0883be6ffc65.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/984.3702308c2905273605c5.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/984.3702308c2905273605c5.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/framework-a300d13a68495d978612.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/framework-a300d13a68495d978612.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/main-42eb8b3f5883ffd33de5.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/main-42eb8b3f5883ffd33de5.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/_error-554a4671c8f80ae7f51d.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/_error-554a4671c8f80ae7f51d.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/account-ebc748c16327efbf32a0.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/account-ebc748c16327efbf32a0.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/embed-4fd67436e85ae16c5ce4.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/embed-4fd67436e85ae16c5ce4.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/i/%5BmarketName%5D/%5BtokenName%5D-3a7ca0cc79106a4296b4.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/i/%5BmarketName%5D/%5BtokenName%5D-3a7ca0cc79106a4296b4.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/iframe/%5BmarketName%5D/%5BtokenName%5D-cd4d9b2ed532370a1b48.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/iframe/%5BmarketName%5D/%5BtokenName%5D-cd4d9b2ed532370a1b48.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/index-91abe15b0d93432404c1.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/index-91abe15b0d93432404c1.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/m/%5Bmarkets%5D-4940f806eb2d38a1e9e2.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/m/%5Bmarkets%5D-4940f806eb2d38a1e9e2.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/r/L/%5BmarketID%5D/%5BtokenID%5D-5f75939b828fdcb7ab69.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/pages/r/L/%5BmarketID%5D/%5BtokenID%5D-5f75939b828fdcb7ab69.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/polyfills-f35e5aaa8964e930bb93.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/polyfills-f35e5aaa8964e930bb93.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/webpack-cfe0eb5c24f7ec699b69.js',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/chunks/webpack-cfe0eb5c24f7ec699b69.js.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/css/2ffe49255a014a9f09a7.css',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/css/2ffe49255a014a9f09a7.css.map',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/Gilroy-Bold.29e8a00a2523137109fc437c948df95a.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/Gilroy-Heavy.76014fe0badb88e06f87a85f89d3fe4a.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/Gilroy-Light.f08220ccb95672d5c17651f3f4c2e83c.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/Gilroy-Medium.3a98bbb5a6e14bbe2c27d480caf6628b.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/Gilroy-Regular.de88caa6b67b3d321011e57102caef0e.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/sf-compact-display-medium-5864711817c30.75aee41c944ba0696326ae212a9cf214.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        {
          url: '/_next/static/media/sf-compact-display-thin-58646eb43a785.613e216ff91a98bcf9c9588d20e8e47f.woff',
          revision: 'KWkQeW8mGQFqRt2uFPBto',
        },
        { url: '/arrow@3x.png', revision: '771d31fd9e0ffb58cf92c902f25885aa' },
        { url: '/coindesk.png', revision: 'b3d807fa49498e12554ec5fbc6e2217b' },
        { url: '/ethereum.png', revision: '115a0ca75d2e28a8a73bf7d32d948e5d' },
        { url: '/favicon.ico', revision: '21b739d43fcb9bbb83d8541fe4fe88fa' },
        { url: '/gray.svg', revision: 'b51631709fd37feb8cf1eb69ceeeba04' },
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
          url: '/icons/icon-192x192-iphone.png',
          revision: '4b4219b71d957feea3cb84c75a4fcd50',
        },
        {
          url: '/icons/icon-192x192.png',
          revision: '43772cdd08d6f48f6edb366b959e1af6',
        },
        {
          url: '/icons/icon-256x256-iphone.png',
          revision: 'e0bcb475be379ff35cc6a54865ed6afa',
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
          url: '/icons/maskable_icon.png',
          revision: '1558f144fdde4b3a28feb4e37c035967',
        },
        {
          url: '/logo-32x32.png',
          revision: 'c180b4b8e61ec0bdc61148a94e6b0b15',
        },
        { url: '/logo.png', revision: 'c180b4b8e61ec0bdc61148a94e6b0b15' },
        { url: '/manifest.json', revision: '28886cb3a27ee477b7bef98ff22d9a10' },
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
              response: t,
              event: s,
              state: a,
            }) =>
              t && 'opaqueredirect' === t.type
                ? new Response(t.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: t.headers,
                  })
                : t,
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
        const t = e.pathname
        return !t.startsWith('/api/auth/') && !!t.startsWith('/api/')
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
//# sourceMappingURL=sw.js.map
