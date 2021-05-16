import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import '../styles/fonts/gilroy/style.css'
import '../styles/fonts/sf-compact-display/style.css'
import '../styles/nprogress.css'
import { ThemeProvider } from 'next-themes'

import CookieConsent from 'react-cookie-consent'
import { createContext, Fragment, ReactNode, useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
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
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import Web3ReactManager from 'components/wallet/Web3ReactManager'

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

function getLibrary(provider: any): Web3 {
  return new Web3(provider)
}

function MyApp({ Component, pageProps }: AppProps) {
  const Layout =
    (Component as typeof Component & {
      layoutProps: {
        Layout: (props: { children: ReactNode } & unknown) => JSX.Element
      }
    }).layoutProps?.Layout || Fragment

  useEffect(() => {
    initIdeaMarketsStore()
    initTokenList()
  }, [])

  useEffect(() => {
    TimeAgo.addDefaultLocale(en)
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
        titleTemplate={DEFAULT_TITLE_TEMPLATE}
        description={DEFAULT_DESCRIPTION}
        canonical={DEFAULT_CANONICAL}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: DEFAULT_CANONICAL,
          site_name: SITE_NAME,
          title: DEFAULT_TITLE,
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
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ReactManager>
            <ThemeProvider attribute="class">
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ThemeProvider>
          </Web3ReactManager>
          <WalletModal />
          <WrongNetworkOverlay />
          <EmailNewsletterModal />
        </Web3ReactProvider>
      </GlobalContext.Provider>
    </>
  )
}

export default MyApp
