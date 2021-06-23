import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import '../styles/fonts/gilroy/style.css'
import '../styles/fonts/sf-compact-display/style.css'
import '../styles/nprogress.css'
import { ThemeProvider } from 'next-themes'

import { createContext, Fragment, ReactNode, useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
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
import ModalRoot from 'components/modals/ModalRoot'
import { WrongNetworkOverlay } from 'components'
import { initMarketStore } from 'store/markets'

export const GlobalContext = createContext({
  onWalletConnectedCallback: () => {},
  setOnWalletConnectedCallback: (f: () => void) => {},
  isEmailHeaderActive: false,
  setIsEmailHeaderActive: (val: boolean) => {},
})

function getLibrary(provider: any): Web3 {
  return new Web3(provider)
}

function MyApp({ Component, pageProps }: AppProps) {
  const Layout =
    (
      Component as typeof Component & {
        layoutProps: {
          Layout: (props: { children: ReactNode } & unknown) => JSX.Element
        }
      }
    ).layoutProps?.Layout || Fragment

  const [isEmailHeaderActive, setIsEmailHeaderActive] = useState(false)
  useEffect(() => {
    const isEmailBarClosed = localStorage.getItem('IS_EMAIL_BAR_CLOSED')
      ? localStorage.getItem('IS_EMAIL_BAR_CLOSED') === 'true'
      : false
    setIsEmailHeaderActive(!isEmailBarClosed)
  }, [])

  useEffect(() => {
    TimeAgo.addDefaultLocale(en)
  }, [])

  const [onWalletConnectedCallback, setOnWalletConnectedCallback] = useState(
    () => () => {}
  )

  initMarketStore()

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
          onWalletConnectedCallback,
          setOnWalletConnectedCallback,
          isEmailHeaderActive,
          setIsEmailHeaderActive,
        }}
      >
        <ThemeProvider attribute="class">
          <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ReactManager>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </Web3ReactManager>
            <WrongNetworkOverlay />
            <ModalRoot />
          </Web3ReactProvider>
        </ThemeProvider>
      </GlobalContext.Provider>
    </>
  )
}

export default MyApp
