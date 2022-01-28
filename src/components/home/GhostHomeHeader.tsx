import React, { useContext, useRef, useState } from 'react'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'pages/_app'
import Image from 'next/image'
import ModalService from 'components/modals/ModalService'
import { ListTokenModal, WalletModal } from 'components'
import A from 'components/A'
// import { useMixPanel } from 'utils/mixPanel'
import { GhostIcon } from 'assets'
import { PlusCircleIcon, XIcon } from '@heroicons/react/outline'
import { isURL } from 'services/URLService'
import useOnClickOutside from 'utils/useOnClickOutside'

const HomeHeader = ({
  setTradeOrListSuccessToggle,
  tradeOrListSuccessToggle,
}: any) => {
  // const { mixpanel } = useMixPanel()
  const { setOnWalletConnectedCallback } = useContext(GlobalContext)
  const [showListingCards, setShowListingCards] = useState(false)
  const [urlInput, setURLInput] = useState('')

  const ref = useRef()
  useOnClickOutside(ref, () => setShowListingCards(false))

  const onURLInputClicked = () => {
    // TODO: move this to Ghost List and Mrket List buttons
    // mixpanel.track('ADD_LISTING_START')

    // const onClose = () => setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        // ModalService.open(ListTokenModal, {}, onClose)
        setShowListingCards(true)
      })
      ModalService.open(WalletModal)
    } else {
      setShowListingCards(true)
    }
  }

  const onURLTyped = (event: any) => {
    setURLInput(event.target.value)
  }

  const isValidURL = isURL(urlInput)

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
      <div className="relative flex flex-col items-center justify-center mt-10 md:flex-row md:w-136 w-full mx-auto">
        <div ref={ref} className="relative w-full">
          {showListingCards ? (
            <XIcon
              onClick={() => setShowListingCards(false)}
              className="absolute w-7 h-7 cursor-pointer"
              style={{ top: 12, right: 10 }}
            />
          ) : (
            <PlusCircleIcon
              onClick={onURLInputClicked}
              className="absolute w-7 h-7 cursor-pointer"
              style={{ top: 12, right: 10 }}
            />
          )}
          <input
            className="py-3 px-4 text-lg font-bold text-white rounded-lg w-full font-sf-compact-medium bg-gray-600"
            onFocus={onURLInputClicked}
            onChange={onURLTyped}
            placeholder="Paste a URL here to add a listing..."
          />
        </div>
        {showListingCards && (
          <div
            ref={ref}
            className="absolute left-0 flex flex-col w-full h-96 z-50 text-left font-inter"
            style={{ top: 64 }}
          >
            <div className="w-full h-40 p-4 text-black bg-white rounded-lg shadow-2xl">
              <span className="text-sm">LISTING PREVIEW</span>
              <div className="bg-gray-200 flex items-center rounded-lg p-4 mt-2">
                {isValidURL ? (
                  <>
                    <GhostIcon className="w-6 h-6 mr-4" />
                    <div className="flex flex-col">
                      <div>Baby Shark | CoComelon Nursury Rhy...</div>
                      <div className="text-xs text-brand-blue">{urlInput}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-red-400">NO URL DETECTED</div>
                )}
              </div>
            </div>
            <div className="flex mt-3">
              <div className="relative w-1/2 h-56 p-4 mr-2 flex flex-col justify-between bg-brand-navy rounded-lg shadow-2xl">
                <GhostIcon className="absolute right-2 top-2 w-14 h-14" />
                <div className="text-xl font-semibold">
                  <div>Ghost Listing</div>
                  <div className="mt-8 text-sm text-gray-300">
                    Free & instant.
                  </div>
                </div>
                <button className="bg-white w-full h-12 text-black font-bold rounded-lg">
                  GHOST LIST
                </button>
              </div>

              <div className="w-1/2 h-56 p-4 flex flex-col justify-between bg-blue-600 rounded-lg shadow-2xl">
                <div className="text-xl font-semibold">
                  <div>Market Listing</div>
                  <div className="md:mt-8 text-sm text-gray-300">
                    Create a tradeable Ideamarket listing with this URL. (gas
                    fee in Arb-ETH)
                  </div>
                </div>
                <button
                  onClick={() =>
                    ModalService.open(ListTokenModal, {}, () =>
                      setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
                    )
                  }
                  className="bg-white w-full h-12 text-black font-bold rounded-lg"
                >
                  LIST ON-CHAIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeHeader
