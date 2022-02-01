import React, { useContext, useRef, useState } from 'react'
import { GlobalContext } from 'pages/_app'
import Image from 'next/image'
import ModalService from 'components/modals/ModalService'
import CreateAccountModal from 'components/account/CreateAccountModal'
import { CircleSpinner, WalletModal } from 'components'
import A from 'components/A'
import { GlobeAltIcon, PlusCircleIcon, XIcon } from '@heroicons/react/outline'
import useOnClickOutside from 'utils/useOnClickOutside'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useQuery } from 'react-query'
import classNames from 'classnames'
import { ghostListToken } from 'actions/web2/ghostListToken'
import { getMarketFromURL } from 'utils/markets'
import { useMarketStore } from 'store/markets'
import { listToken, verifyTokenName } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { onChainListToken } from 'actions/web2/onChainListToken'
import { useMixPanel } from 'utils/mixPanel'
import { useTransactionManager } from 'utils'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'

const HomeHeader = ({
  setTradeOrListSuccessToggle,
  tradeOrListSuccessToggle,
}: any) => {
  const { mixpanel } = useMixPanel()
  const txManager = useTransactionManager()
  const { active } = useWeb3React()
  const { jwtToken } = useContext(GlobalContext)
  const [showListingCards, setShowListingCards] = useState(false)
  const [urlInput, setURLInput] = useState('')
  const [finalTokenValue, setFinalTokenValue] = useState('')
  // const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [isListing, setIsListing] = useState(false) // Is a listing in progress? (API call for Ghost List and contract call for OnChain List)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isAlreadyGhostListed, setIsAlreadyGhostListed] = useState(false)
  const [isAlreadyOnChain, setIsAlreadyOnChain] = useState(false)

  const ref = useRef()
  useOnClickOutside(ref, () => setShowListingCards(false))

  const onURLInputClicked = () => {
    // mixpanel.track('ADD_LISTING_START')
    setShowListingCards(true)
  }

  const markets = useMarketStore((state) => state.markets)

  const onURLTyped = async (event: any) => {
    const typedURL = event.target.value

    const market = getMarketFromURL(typedURL, markets)

    const {
      isValid,
      isAlreadyGhostListed,
      isAlreadyOnChain,
      finalTokenValue,
      canonical,
    } = await verifyTokenName(typedURL, market, active)

    setURLInput(canonical)
    setFinalTokenValue(finalTokenValue)

    setIsValidToken(isValid)
    setIsAlreadyGhostListed(isAlreadyGhostListed)
    setIsAlreadyOnChain(isAlreadyOnChain)
  }

  const onTradeComplete = (
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES,
    selectedMarket: any
  ) => {
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      marketName: selectedMarket.name,
      transactionType,
    })
  }

  /**
   * User clicked the button to list token on Ghost Market
   */
  const onClickGhostList = async () => {

    // TODO: if jwtToken is not present, then popup modal to ask user to create account or sign in
    if (!jwtToken) {
      ModalService.open(CreateAccountModal, {}, () => setShowListingCards(true))
      return
    }

    setIsListing(true)
    const market = getMarketFromURL(urlInput, markets)

    await ghostListToken(urlInput, market?.marketID, jwtToken)

    setIsListing(false)
    setShowListingCards(false)
    setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
  }

  /**
   * User clicked the button to list token on chain
   */
  const onClickOnChainList = async () => {
    setIsListing(true)
    const market = getMarketFromURL(urlInput, markets)

    // TODO: do actual contract part right here
    mixpanel.track(`ADD_LISTING_${market.name.toUpperCase()}`)

    // if (isWantBuyChecked) {
    //   const giftAddress = isENSAddressValid ? hexAddress : recipientAddress
    //   try {
    //     await txManager.executeTx(
    //       'List and buy',
    //       listAndBuyToken,
    //       tokenName,
    //       market,
    //       buyPayWithAddress,
    //       buyOutputAmountBN,
    //       buyInputAmountBN,
    //       buySlippage,
    //       buyLock ? 31556952 : 0,
    //       isGiftChecked ? giftAddress : account
    //     )
    //   } catch (ex) {
    //     console.log(ex)
    //     onTradeComplete(false, tokenName, TRANSACTION_TYPES.NONE)
    //     return
    //   }

    //   close()
    //   onTradeComplete(true, tokenName, TRANSACTION_TYPES.BUY)
    //   mixpanel.track(
    //     `ADD_LISTING_${selectedMarket.name.toUpperCase()}_COMPLETED`
    //   )
    // } else {

    console.log('finalTokenValue==', finalTokenValue)
    console.log('market==', market)
    console.log('jwtToken==', jwtToken)

    try {
      await txManager.executeTx(
        'List Token',
        listToken,
        finalTokenValue,
        market.marketID
      )
    } catch (ex) {
      console.log(ex)
      setIsListing(false)
      onTradeComplete(false, finalTokenValue, TRANSACTION_TYPES.NONE, market)
      return
    }
    // close()
    onTradeComplete(true, finalTokenValue, TRANSACTION_TYPES.LIST, market)
    mixpanel.track(`ADD_LISTING_${market.name.toUpperCase()}_COMPLETED`)
    // }

    await onChainListToken(
      finalTokenValue,
      urlInput,
      market?.marketID,
      jwtToken
    )

    setIsListing(false)
    setShowListingCards(false)
    setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
  }

  const { data: urlMetaData, isLoading: isURLMetaDataLoading } = useQuery(
    [urlInput],
    getURLMetaData
  )

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
        <div className="relative w-full">
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
            className="py-3 pl-4 pr-12 text-lg font-bold text-white rounded-lg w-full font-sf-compact-medium bg-gray-600"
            onFocus={onURLInputClicked}
            onChange={onURLTyped}
            placeholder="Paste a URL here to add a listing..."
          />
        </div>
        {showListingCards && (
          // Needed wrapper div so hover-over container doesn't disappear when moving from button to container. Used random height, this can change if needed
          <div className="absolute top-0 left-0 w-full h-36">
            <div
              ref={ref}
              className="absolute left-0 flex flex-col w-full h-96 z-50 text-left font-inter"
              style={{ top: 64 }}
            >
              <div className="w-full p-4 text-black bg-white rounded-lg shadow-2xl">
                <div className="flex items-center space-x-2 mb-4 text-lg">
                  <div className="font-bold">Listing on</div>
                  <div className="bg-gray-200 flex items-center rounded-lg px-2 py-1 text-sm">
                    <GlobeAltIcon className="w-5 mr-1" />
                    URLs
                  </div>
                  <div className="font-bold">Market</div>
                </div>

                <div className="bg-gray-200 flex items-center rounded-lg p-4 mt-2">
                  {isValidToken && (
                    <>
                      {/* <GhostIcon className="w-6 h-6 mr-4" /> */}
                      {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
                      <div className="flex flex-col w-full">
                        <div className="leading-5">
                          <div className="inline font-medium mr-1">
                            {!isURLMetaDataLoading &&
                            urlMetaData &&
                            urlMetaData?.ogTitle
                              ? urlMetaData.ogTitle
                              : 'loading'}
                          </div>
                        </div>

                        <a
                          href={urlInput}
                          className="text-brand-blue font-normal text-sm mt-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {urlInput?.substr(
                            0,
                            urlInput?.length > 60 ? 60 : urlInput?.length
                          ) + (urlInput?.length > 60 ? '...' : '')}
                        </a>
                        <a
                          href={urlInput}
                          className="h-56 mb-4 cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="rounded-xl mt-4 h-full"
                            src={
                              !isURLMetaDataLoading &&
                              urlMetaData &&
                              urlMetaData?.ogImage
                                ? urlMetaData.ogImage
                                : '/gray.svg'
                            }
                            alt=""
                          />
                        </a>
                        <div className="mt-4 text-gray-400 text-sm text-left leading-5">
                          {!isURLMetaDataLoading &&
                          urlMetaData &&
                          urlMetaData?.ogDescription
                            ? urlMetaData?.ogDescription.substr(
                                0,
                                urlMetaData?.ogDescription.length > 150
                                  ? 150
                                  : urlMetaData?.ogDescription.length
                              ) +
                              (urlMetaData?.ogDescription.length > 150
                                ? '...'
                                : '')
                            : 'No description found'}
                        </div>
                      </div>
                    </>
                  )}
                  {!isValidToken &&
                    !isAlreadyGhostListed &&
                    !isAlreadyOnChain && (
                      <div className="text-red-400">INVALID URL</div>
                    )}
                  {!isAlreadyOnChain && isAlreadyGhostListed && (
                    <div className="text-red-400">
                      THIS URL IS ALREADY GHOST LISTED
                    </div>
                  )}
                  {isAlreadyOnChain && (
                    <div className="text-red-400">
                      THIS URL IS ALREADY LISTED ON-CHAIN
                    </div>
                  )}
                </div>

                {/* <div className="flex items-center mt-4 text-sm">
                  <input
                    type="checkbox"
                    id="listAndBuyCheckbox"
                    className="cursor-pointer"
                    checked={isWantBuyChecked}
                    onChange={(e) => {
                      setIsWantBuyChecked(e.target.checked)
                    }}
                  />
                  <label
                    htmlFor="listAndBuyCheckbox"
                    className={classNames(
                      'ml-2 font-bold cursor-pointer',
                      isWantBuyChecked
                        ? 'text-brand-blue dark:text-blue-400'
                        : 'text-black dark:text-gray-300'
                    )}
                  >
                    I want to immediately buy this token
                  </label>
                </div> */}

                {active ? (
                  <div className="flex justify-between items-center space-x-4 mt-4">
                    <button
                      onClick={onClickGhostList}
                      disabled={!isValidToken}
                      className={classNames(
                        'flex flex-col justify-center items-center w-full h-20 rounded-lg',
                        !isValidToken
                          ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                          : 'text-white bg-brand-navy'
                      )}
                    >
                      <div className="font-bold text-lg">
                        List on Ghost Market
                      </div>
                      <div className="text-sm">Free & instant</div>
                    </button>

                    <button
                      onClick={onClickOnChainList}
                      disabled={!isValidToken}
                      className={classNames(
                        'flex flex-col justify-center items-center w-full h-20 font-bold rounded-lg',
                        !isValidToken
                          ? 'text-brand-gray-2 dark:text-gray-300 bg-brand-gray dark:bg-gray-500 cursor-default border-brand-gray'
                          : 'text-white bg-blue-500 '
                      )}
                    >
                      <div className="font-bold text-lg">List On-Chain</div>
                      <div className="text-sm">
                        Tradeable Ideamarket listing
                      </div>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => ModalService.open(WalletModal, {}, () => setShowListingCards(true))}
                    className="text-white bg-blue-500 flex flex-col justify-center items-center w-full h-20 mt-4 font-bold rounded-lg"
                  >
                    <div className="font-bold text-lg">CONNECT WALLET</div>
                    <div className="text-sm opacity-75">
                      to continue adding a listing
                    </div>
                  </button>
                )}

                {isListing && (
                  <div className="flex items-center">
                    <div>Listing in progress...</div>
                    <CircleSpinner color="#0857e0" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeHeader
