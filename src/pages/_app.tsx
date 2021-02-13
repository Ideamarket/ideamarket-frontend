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

  useEffect(() => {
    const emailNewsletterModalWasOpened = localStorage.getItem(
      'EMAIL_NEWSLETTER_WAS_SEEN'
    )

    if (!emailNewsletterModalWasOpened) {
      setTimeout(() => {
        const emailNewsletterModalWasOpened = localStorage.getItem(
          'EMAIL_NEWSLETTER_WAS_SEEN'
        )
        if (!emailNewsletterModalWasOpened) {
          setIsEmailNewsletterModalOpen(true)
        }
      }, 30000)
    }
  }, [])

  return (
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
  )
}

export default MyApp
