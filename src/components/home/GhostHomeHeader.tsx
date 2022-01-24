import React, { useContext } from 'react'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'pages/_app'
import Image from 'next/image'
import ModalService from 'components/modals/ModalService'
import { ListTokenModal, WalletModal } from 'components'
import A from 'components/A'
import { useMixPanel } from 'utils/mixPanel'

const HomeHeader = ({
  setTradeOrListSuccessToggle,
  tradeOrListSuccessToggle,
}: any) => {
  const { mixpanel } = useMixPanel()
  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const onListTokenClicked = () => {
    mixpanel.track('ADD_LISTING_START')

    const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(ListTokenModal, {}, onClose)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(ListTokenModal, {}, onClose)
    }
  }

  return (
    <div className="px-6 pt-10 pb-40 text-center text-white bg-cover dark:text-gray-200 bg-top-mobile md:bg-top-desktop">
      <div>
        <div className="flex flex-wrap justify-center mt-4">
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.nasdaq.com/articles/ideamarket-is-a-literal-marketplace-for-ideas-and-online-reputation-2021-02-19">
              <div className="relative h-8 opacity-50 w-36">
                <Image
                  src="/nasdaq.png"
                  alt="Nasdaq"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.vice.com/en/article/pkd8nb/people-have-spent-over-dollar1-million-on-a-literal-marketplace-of-ideas">
              <div className="relative w-32 h-8 opacity-50">
                <Image
                  src="/vice.png"
                  alt="Vice"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
          <div
            className="flex justify-center flex-grow-0 flex-shrink-0 mt-4"
            data-aos="zoom-y-out"
          >
            <A href="https://www.coindesk.com/ideamarket-online-ideas-online-reputation">
              <div className="relative h-8 opacity-50 w-36">
                <Image
                  src="/coindesk.png"
                  alt="Coindesk"
                  layout="fill"
                  objectFit="contain"
                  priority={true}
                  className="rounded-full"
                />
              </div>
            </A>
          </div>
        </div>
        <h2 className="mt-8 text-3xl md:text-6xl font-gilroy-bold">
          The credibility layer
          <span className="text-brand-blue"> of the internet</span>
        </h2>
        <p className="mt-8 text-lg md:text-2xl font-sf-compact-medium">
          Buy on the right side of history.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center md:flex-row w-96 mx-auto">
        <input
          className="p-2 mt-10 text-lg font-bold text-white rounded-lg w-full font-sf-compact-medium bg-gray-600"
          onChange={onListTokenClicked}
          placeholder="Past a URL here to add a listing..."
        />
      </div>
    </div>
  )
}

export default HomeHeader
