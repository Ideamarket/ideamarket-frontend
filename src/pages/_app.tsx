import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import '../styles/fonts/gilroy/style.css'
import '../styles/fonts/sf-compact-display/style.css'
import '../styles/fonts/inter/style.css'
import '../styles/nprogress.css'
import { ThemeProvider } from 'next-themes'

import { ReactElement } from 'react'
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
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'
import Web3ReactManager from 'components/wallet/Web3ReactManager'
import ModalRoot from 'components/modals/ModalRoot'
import { WrongNetworkOverlay } from 'components'
import { initUseMarketStore } from 'store/markets'
//import ModalService from 'components/modals/ModalService'
//import MigrationDoneModal from 'components/MigrationDoneModal'
import { Provider } from 'next-auth/client'
import { NextPage } from 'next'

import MixPanelProvider from 'utils/mixPanel'
import { GlobalContextComponent } from 'lib/GlobalContext'
import { ClientWrapper } from 'lib/ClientWrapper'
export { GlobalContext } from 'lib/GlobalContext'

function getLibrary(provider: any): Web3 {
  return new Web3(provider)
}

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement<any, any>
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  initUseMarketStore()

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
      <Provider session={pageProps.session}>
        <GlobalContextComponent>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Web3ReactProvider getLibrary={getLibrary}>
              <Web3ReactManager>
                <ClientWrapper>
                  <MixPanelProvider>
                    {getLayout(<Component {...pageProps} />)}
                  </MixPanelProvider>
                </ClientWrapper>
              </Web3ReactManager>
              <WrongNetworkOverlay />
              <ModalRoot />
            </Web3ReactProvider>
          </ThemeProvider>
        </GlobalContextComponent>
      </Provider>
    </>
  )
}

export default MyApp
