import React, { useContext, useRef, useState } from 'react'
import { GlobalContext } from 'pages/_app'
import Image from 'next/image'
import ModalService from 'components/modals/ModalService'
import CreateAccountModal from 'components/account/CreateAccountModal'
import A from 'components/A'
import {
  ExternalLinkIcon,
  PlusCircleIcon,
  XIcon,
} from '@heroicons/react/outline'
import useOnClickOutside from 'utils/useOnClickOutside'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useQuery } from 'react-query'
import { ghostListToken } from 'actions/web2/ghostListToken'
import { getMarketFromURL } from 'utils/markets'
import { useMarketStore } from 'store/markets'
import { listToken, verifyTokenName } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { useMixPanel } from 'utils/mixPanel'
import BN from 'bn.js'
import {
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
  useTransactionManager,
  web3BNToFloatString,
} from 'utils'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
import useAuth from 'components/account/useAuth'
import { getSignedInWalletAddress } from 'lib/utils/web3-eth'
import { queryDaiBalance } from 'store/daiStore'
import { NETWORK } from 'store/networks'
import { getValidURL } from 'actions/web2/getValidURL'
import { addTrigger } from 'actions/web2/addTrigger'
import ListMeContent from './ListMeContent'
import { getCategories } from 'actions/web2/getCategories'

const HomeHeader = ({
  setTradeOrListSuccessToggle,
  tradeOrListSuccessToggle,
}: any) => {
  const { mixpanel } = useMixPanel()
  const txManager = useTransactionManager()
  const { active, account, library } = useWeb3React()
  const { jwtToken } = useContext(GlobalContext)
  const [showListingCards, setShowListingCards] = useState(false)
  const [finalURL, setFinalURL] = useState('')
  const [urlInput, setURLInput] = useState('')
  const [finalTokenValue, setFinalTokenValue] = useState('')
  // const [isWantBuyChecked, setIsWantBuyChecked] = useState(false)
  const [isListing, setIsListing] = useState(false) // Is a listing in progress? (API call for Ghost List and contract call for OnChain List)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isAlreadyGhostListed, setIsAlreadyGhostListed] = useState(false)
  const [isAlreadyOnChain, setIsAlreadyOnChain] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [ghostCategories, setGhostCategories] = useState([]) // The categories that were already selected by ghost lister (these are only displayed when converting from ghost to onchain listing)

  const { interestManagerAVM: interestManagerAddress } =
    NETWORK.getDeployedAddresses()

  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance', interestManagerAddress],
    queryDaiBalance,
    {
      refetchOnWindowFocus: false,
    }
  )

  const daiBalance = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(
      interestManagerDaiBalance || new BN('0'),
      bigNumberTenPow18,
      0
    )
  )

  const ref = useRef()
  useOnClickOutside(ref, () => setShowListingCards(false))

  const onURLInputClicked = () => {
    // mixpanel.track('ADD_LISTING_START')
    setShowListingCards(true)
  }

  const markets = useMarketStore((state) => state.markets)

  const onURLTyped = async (event: any) => {
    const typedURL = event.target.value

    setURLInput(typedURL)
    setSelectedCategories([]) // Set selected categories to none if any input typed

    const canonical = await getValidURL(typedURL)

    const market = getMarketFromURL(canonical, markets)

    // console.log('market from typed URL==', market)  // Keep here for debug purposes

    const {
      isValid,
      isAlreadyGhostListed,
      isAlreadyOnChain,
      finalTokenValue,
      ghostCategories,
    } = await verifyTokenName(canonical, market, active)

    setFinalURL(canonical)
    setFinalTokenValue(finalTokenValue)
    setGhostCategories(ghostCategories)

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

  const { loginByWallet } = useAuth()

  const onLoginClicked = async () => {
    if (active) {
      const signedWalletAddress = await getSignedInWalletAddress({
        account,
        library,
      })
      await loginByWallet(signedWalletAddress)
    }
  }

  /**
   * User clicked the button to list token on Ghost Market
   */
  const onClickGhostList = async () => {
    // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
    if (!jwtToken) {
      onLoginClicked()
      ModalService.open(CreateAccountModal, {}, () => setShowListingCards(true))
      return
    }

    setIsListing(true)
    const market = getMarketFromURL(finalURL, markets)

    mixpanel.track(`LIST_GHOST_${market.name.toUpperCase()}`)

    const ghostListResponse = await ghostListToken(
      finalURL,
      market,
      jwtToken,
      selectedCategories
    )

    setIsListing(false)
    setFinalURL('')
    setURLInput('')
    setIsValidToken(false)
    setShowListingCards(false)
    setSelectedCategories([])
    setGhostCategories([])

    if (!ghostListResponse) {
      return // Do not show success modal if it was a failed ghost list
    }

    mixpanel.track(`LIST_GHOST_${market.name.toUpperCase()}_COMPLETED`)

    setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
    onTradeComplete(true, finalTokenValue, TRANSACTION_TYPES.GHOST_LIST, market)
  }

  /**
   * User clicked the button to list token on chain
   */
  const onClickOnChainList = async () => {
    setIsListing(true)
    const market = getMarketFromURL(finalURL, markets)

    mixpanel.track(`LIST_ONCHAIN_${market.name.toUpperCase()}`)

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

    try {
      await txManager.executeTxWithCallbacks(
        'List Token',
        listToken,
        {
          onReceipt: async (receipt: any) => {
            const tokenID = receipt?.events?.NewToken?.returnValues[0]
            await addTrigger(tokenID, market?.marketID, selectedCategories)
          },
        },
        finalTokenValue,
        market.marketID
      )
    } catch (ex) {
      console.error(ex)
      setIsListing(false)
      setFinalURL('')
      setURLInput('')
      setIsValidToken(false)
      setShowListingCards(false)
      setSelectedCategories([])
      setGhostCategories([])
      onTradeComplete(false, finalTokenValue, TRANSACTION_TYPES.NONE, market)
      return
    }
    // close()
    // }

    onTradeComplete(true, finalTokenValue, TRANSACTION_TYPES.LIST, market)
    mixpanel.track(`LIST_ONCHAIN_${market.name.toUpperCase()}_COMPLETED`)

    setIsListing(false)
    setFinalURL('')
    setURLInput('')
    setSelectedCategories([])
    setGhostCategories([])
    setIsValidToken(false)
    setShowListingCards(false)
    setTradeOrListSuccessToggle(!tradeOrListSuccessToggle)
  }

  const { data: urlMetaData, isLoading: isURLMetaDataLoading } = useQuery(
    [finalURL],
    getURLMetaData
  )

  const { data: categoriesData } = useQuery([true], getCategories)

  return (
    <div className="px-6 pt-10 pb-40 text-center text-white font-inter bg-cover dark:text-gray-200 bg-top-mobile md:bg-top-desktop">
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
          Make lying
          <span className="text-brand-blue"> expensive.</span>
        </h2>
        <p className="mt-8 md:px-28 text-sm md:text-lg">
          <span className="inline-block mr-1">
            Ideamarket values the world's information,
          </span>
          <span className="inline-block mr-1">
            creating public narratives without third parties.{' '}
          </span>
          <A
            href="https://docs.ideamarket.io"
            className="underline inline-block hover:text-brand-blue opacity-60 cursor-pointer"
          >
            <span>How it Works</span>
            <ExternalLinkIcon className="w-5 inline ml-1 mb-1" />
          </A>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center mt-4 md:mt-10 text-md md:text-3xl font-gilroy-bold md:flex-row">
        <div className="text-2xl text-brand-blue md:text-5xl">
          ${daiBalance}
        </div>
        <div className="md:ml-2">of information valued</div>
        <div
          className="flex justify-center flex-grow-0 flex-shrink-0 mt-8 md:mt-0 md:ml-6 mr-8 md:mr-0"
          data-aos="zoom-y-out"
        >
          <A href="https://docs.ideamarket.io/contracts/audit">
            <div className="relative h-8 opacity-50 w-40">
              <Image
                src="/Quantstamp.svg"
                alt="Quantstamp"
                layout="fill"
                objectFit="contain"
                priority={true}
                className="rounded-full"
              />
            </div>
          </A>
        </div>
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
            className="py-3 pl-4 pr-12 text-lg font-bold text-white rounded-lg w-full bg-white/[.1]"
            onFocus={onURLInputClicked}
            onChange={onURLTyped}
            value={urlInput}
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
              <ListMeContent
                isAlreadyGhostListed={isAlreadyGhostListed}
                isAlreadyOnChain={isAlreadyOnChain}
                isValidToken={isValidToken}
                isURLMetaDataLoading={isURLMetaDataLoading}
                urlMetaData={urlMetaData}
                finalURL={finalURL}
                isWalletConnected={active}
                isListing={isListing}
                categoriesData={categoriesData}
                selectedCategories={selectedCategories}
                ghostCategories={ghostCategories}
                setSelectedCategories={setSelectedCategories}
                onClickGhostList={onClickGhostList}
                onClickOnChainList={onClickOnChainList}
                setShowListingCards={setShowListingCards}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeHeader
