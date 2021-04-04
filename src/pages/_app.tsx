import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import '../styles/fonts/gilroy/style.css'
import '../styles/fonts/sf-compact-display/style.css'
import '../styles/nprogress.css'

import CookieConsent from 'react-cookie-consent'
import { createContext, useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { initWalletStore } from 'store/walletStore'
import { initIdeaMarketsStore } from 'store/ideaMarketsStore'
import { initTokenList } from 'store/tokenListStore'
import {
  NavBar,
  WrongNetworkOverlay,
  WalletModal,
  EmailNewsletterModal,
} from 'components'
import { Toaster } from 'react-hot-toast'
import { DefaultSeo } from 'next-seo'
import {
  DEFAULT_CANONICAL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  DEFAULT_TITLE_TEMPLATE,
  FAVICON_LINK,
  SITE_NAME,
  TWITTER_HANDLE,
} from 'utils/seo-constants'

export const GlobalContext = createContext({
  isWalletModalOpen: false,
  setIsWalletModalOpen: (val: boolean) => {},
  onWalletConnectedCallback: () => {},
  setOnWalletConnectedCallback: (f: () => void) => {},
  isListTokenModalOpen: false,
  setIsListTokenModalOpen: (val: boolean) => {},
  isEmailNewsletterModalOpen: false,
  setIsEmailNewsletterModalOpen: (val: boolean) => {},
})

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initWalletStore()
    initIdeaMarketsStore()
    initTokenList()
  }, [])

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [
    onWalletConnectedCallback,
    setOnWalletConnectedCallback,
  ] = useState(() => () => {})

  const [isListTokenModalOpen, setIsListTokenModalOpen] = useState(false)

  const [isEmailNewsletterModalOpen, _setIsEmailNewsletterModalOpen] = useState(
    false
  )

  const setIsEmailNewsletterModalOpen = (b: boolean) => {
    localStorage.setItem('EMAIL_NEWSLETTER_WAS_SEEN', 'true')
    _setIsEmailNewsletterModalOpen(b)
  }

  return (
    <>
      <DefaultSeo
        title={DEFAULT_TITLE}
        titleTemplate={DEFAULT_TITLE_TEMPLATE}
        description={DEFAULT_DESCRIPTION}
        canonical={DEFAULT_CANONICAL}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: DEFAULT_CANONICAL,
          site_name: SITE_NAME,
          title: SITE_NAME,
          description: DEFAULT_DESCRIPTION,
          images: [
            {
              url: DEFAULT_OG_IMAGE,
              alt: SITE_NAME,
            },
          ],
        }}
        twitter={{
          handle: TWITTER_HANDLE,
          site: TWITTER_HANDLE,
          cardType: 'summary_large_image',
        }}
        additionalLinkTags={[
          {
            rel: 'shortcut icon',
            href: FAVICON_LINK,
          },
        ]}
      />
      <GlobalContext.Provider
        value={{
          isWalletModalOpen,
          setIsWalletModalOpen,
          onWalletConnectedCallback,
          setOnWalletConnectedCallback,
          isListTokenModalOpen,
          setIsListTokenModalOpen,
          isEmailNewsletterModalOpen,
          setIsEmailNewsletterModalOpen,
        }}
      >
        <Toaster />
        <Head>
          <title>Ideamarket</title>
        </Head>
        <div className="min-h-screen bg-brand-gray">
          <NavBar />
          <div className="py-16">
            <Component {...pageProps} />
          </div>
        </div>
        <CookieConsent
          style={{ background: '#708090' }}
          buttonStyle={{
            background: '#0857e0',
            color: 'white',
            fontSize: '13px',
          }}
        >
          This website uses cookies to enhance the user experience.
        </CookieConsent>
        <WalletModal />
        <WrongNetworkOverlay />
        <EmailNewsletterModal />
      </GlobalContext.Provider>
    </>
  )
}

export default MyApp
