/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery, useInfiniteQuery } from 'react-query'
import { DefaultLayout, WalletModal, WatchingStar } from 'components'
import {
  IdeaToken,
  queryMarket,
  querySingleToken,
} from 'store/ideaMarketsStore'
import { GetServerSideProps } from 'next'
import ModalService from 'components/modals/ModalService'
import ListingSEO from 'components/listing-page/ListingSEO'
import { ReactElement, useContext, useEffect, useState } from 'react'
import {
  bigNumberTenPow18,
  calculateCurrentPriceBN,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
} from 'utils'
import { ChatIcon, ShareIcon } from '@heroicons/react/outline'
import { useBalance } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'lib/GlobalContext'
// import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'
import { getMarketSpecificsByMarketName } from 'store/markets'
import ListingContent from 'components/tokens/ListingContent'
import RateModal from 'components/trade/RateModal'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import useOpinionsByIDTAddress from 'modules/ratings/hooks/useOpinionsByIDTAddress'
import copy from 'copy-to-clipboard'
import { getURL } from 'utils/seo-constants'
import toast from 'react-hot-toast'
import getLatestOpinionsAboutAddress from 'actions/web3/getLatestOpinionsAboutAddress'
import { flatten } from 'lodash'
import OpinionTable from 'modules/ratings/components/ListingPage/OpinionTable'
import classNames from 'classnames'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DetailsSkeleton = () => (
  <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
    <span className="invisible">A</span>
  </div>
)

const TOKENS_PER_PAGE = 10

const infiniteQueryConfig = {
  getNextPageParam: (lastGroup, allGroups) => {
    const morePagesExist = lastGroup?.length === TOKENS_PER_PAGE

    if (!morePagesExist) {
      return false
    }

    return allGroups.length * TOKENS_PER_PAGE
  },
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  enabled: true, // This apparently decides if data is loaded on page load or not
  keepPreviousData: true,
}

const TokenDetails = ({ rawTokenId }: { rawTokenId: string }) => {
  const { account } = useWeb3React()
  const { jwtToken } = useContext(GlobalContext)

  const {
    data: token,
    isLoading: isTokenLoading,
    refetch,
  } = useQuery(['single-listing'], () =>
    querySingleToken(null, null, null, rawTokenId, jwtToken)
  )

  // const { onchainListedAt, onchainListedBy } =
  //   (token || {}) as any

  // const timeAfterOnChainListedInDays = useMemo(() => {
  //   if (!onchainListedAt) return null
  //   const onchainListedAtDate = new Date(onchainListedAt)
  //   const currentDate = new Date()
  //   return getTimeDifferenceIndays(onchainListedAtDate, currentDate)
  // }, [onchainListedAt])

  const marketName = token?.marketName
  const tokenName = token?.name ? token?.name : token?.url

  const marketSpecifics = getMarketSpecificsByMarketName(marketName)

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [`market-${marketName}`],
    () => queryMarket(marketName)
  )

  async function opinionsQueryFunction(numTokens: number, skip: number = 0) {
    const latestOpinions = await getLatestOpinionsAboutAddress(token?.address)
    return latestOpinions || []
  }

  const {
    data: infiniteOpinionsData,
    isFetching: isOpinionsDataLoading,
    fetchNextPage: fetchMoreOpinions,
    refetch: refetchOpinions,
    hasNextPage: canFetchMoreOpinions,
  } = useInfiniteQuery(
    ['opinions', token],
    ({ pageParam = 0 }) => opinionsQueryFunction(TOKENS_PER_PAGE, pageParam),
    infiniteQueryConfig
  )

  const opinionPairs = flatten(infiniteOpinionsData?.pages || [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tradeToggle, setTradeToggle] = useState(false) // Need toggle to reload balances after trade

  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [nameSearch, setNameSearch] = useState('')

  const [, ideaTokenBalanceBN] = useBalance(
    token?.address,
    account,
    18,
    tradeToggle
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ideaTokenBalanceDisplay = ideaTokenBalanceBN
    ? formatNumberWithCommasAsThousandsSerperator(
        web3BNToFloatString(ideaTokenBalanceBN, bigNumberTenPow18, 2)
      )
    : '0'

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const initializeTwitterAPI = () => {
      // You can add this as script tag in <head>, but for some reason that way stopped working. But this works fine for now
      const s = document.createElement('script')
      s.setAttribute('src', 'https://platform.twitter.com/widgets.js')
      s.setAttribute('async', 'true')
      document.head.appendChild(s)
    }

    const timeout = setTimeout(
      () => (window as any)?.twttr?.widgets?.load(),
      3000
    ) // Load tweets

    initializeTwitterAPI()

    // Track using local state if page has been scrolled from top or not
    const handleElementDisplay = () => {
      const scrollAmount = window.scrollY || document.documentElement.scrollTop
      if (scrollAmount > 0) setIsScrolled(true)
      else setIsScrolled(false)
    }

    window.addEventListener('scroll', handleElementDisplay)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', handleElementDisplay)
    }
  }, [rawTokenId])

  const url = token?.url

  const { data: urlMetaData } = useQuery([url], () => getURLMetaData(url))

  const displayName =
    urlMetaData && urlMetaData?.ogTitle
      ? urlMetaData?.ogTitle
      : marketSpecifics?.convertUserInputToTokenName(token?.url)

  const isLoading = isTokenLoading || isMarketLoading /*||
    isInterestManagerTotalSharesLoading ||
    isInterestManagerDaiBalanceLoading*/

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenPrice =
    isLoading || !token || !token?.isOnChain
      ? ''
      : web3BNToFloatString(
          calculateCurrentPriceBN(
            token?.rawSupply,
            market.rawBaseCost,
            market.rawPriceRise,
            market.rawHatchTokens
          ),
          bigNumberTenPow18,
          2
        )

  // const onTradeComplete = () => {
  //   refetch()
  //   setTradeToggle(!tradeToggle)
  // }

  // const onTradeClicked = (tradeType: TX_TYPES) => {
  //   if (!useWalletStore.getState().web3) {
  //     setOnWalletConnectedCallback(() => () => {
  //       ModalService.open(
  //         TradeModal,
  //         { ideaToken: token, market, startingTradeType: tradeType },
  //         onTradeComplete
  //       )
  //     })
  //     ModalService.open(WalletModal)
  //   } else {
  //     ModalService.open(
  //       TradeModal,
  //       { ideaToken: token, market, startingTradeType: tradeType },
  //       onTradeComplete
  //     )
  //   }
  // }

  // const onVerifyClicked = () => {
  //   const onClose = () => refetch()
  //   ModalService.open(VerifyModal, { market, token }, onClose)
  // }

  const copyListingPageURL = () => {
    const url = `${getURL()}/i/${token?.address}`
    copy(url)
    toast.success('Copied listing page URL')
  }

  const onRateClicked = (token: IdeaToken, urlMetaData: any) => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(RateModal, { ideaToken: token, urlMetaData }, refetch)
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(RateModal, { ideaToken: token, urlMetaData }, refetch)
    }
  }

  const listingType = getListingTypeFromIDTURL(token?.url)

  return (
    <>
      <ListingSEO
        tokenName={tokenName}
        rawMarketName={marketName}
        rawTokenName={rawTokenId}
      />

      {/* Start of top section of listing page */}
      <div className="mt-10 mx-5 md:mx-10">
        <div className="text-black/[.5]">Market / Listings</div>

        {/* Desktop -- top section of listing page */}
        <div className="hidden lg:flex items-start w-full mt-4">
          <div className="w-1/3">
            <div className="w-48 rounded-lg border-2 flex flex-col divide-y-2">
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Composite Rating</span>
                <span className="font-bold">97</span>
              </div> */}
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Average Rating</span>
                <span className="font-bold">{token?.averageRating}</span>
              </div>
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Comments</span>
                <span className="flex items-center font-bold">
                  <ChatIcon className="w-4 mr-1 mt-0.5" />
                  {token?.latestCommentsCount}
                </span>
              </div>
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Market Interest</span>
                <span className="font-bold">$42,693</span>
              </div> */}
            </div>
          </div>

          <div className="w-1/3 flex items-start">
            {listingType === LISTING_TYPE.TWEET ? (
              <ListingContent
                ideaToken={token}
                page="ListingPage"
                urlMetaData={urlMetaData}
                useMetaData={false}
              />
            ) : (
              <>
                {/* This wrapper div combined with object-cover keeps images in correct size */}
                <div className="aspect-[16/9] w-36">
                  {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
                  <img
                    className="rounded-xl h-full object-cover"
                    src={
                      urlMetaData && urlMetaData?.ogImage
                        ? urlMetaData.ogImage
                        : '/gray.svg'
                    }
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="ml-4 text-base font-medium leading-5 truncate z-30">
                  <div>
                    <a
                      href={`/i/${token?.address}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs md:text-base font-bold hover:underline"
                    >
                      {displayName?.substr(
                        0,
                        displayName?.length > 50 ? 50 : displayName?.length
                      ) + (displayName?.length > 50 ? '...' : '')}
                    </a>
                  </div>
                  <a
                    href={token?.url}
                    className="text-xs md:text-sm text-brand-blue hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token?.url.substr(
                      0,
                      token?.url.length > 50 ? 50 : token?.url.length
                    ) + (token?.url.length > 50 ? '...' : '')}
                  </a>
                  <div className="w-96 mt-2 text-xs text-left text-black/[.5] leading-4 whitespace-normal">
                    {urlMetaData &&
                      urlMetaData?.ogDescription &&
                      urlMetaData?.ogDescription.substr(
                        0,
                        urlMetaData?.ogDescription.length > 160
                          ? 160
                          : urlMetaData?.ogDescription.length
                      ) +
                        (urlMetaData?.ogDescription.length > 160 ? '...' : '')}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-1/3 flex flex-col items-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-48 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>

            <div className="flex justify-between items-center space-x-2 w-48 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyListingPageURL()
                }}
                className="flex justify-center items-center w-[80%] h-10 border-2 text-black text-base font-medium text-white rounded-lg hover:bg-blue-500 hover:text-white dark:text-gray-300 tracking-tightest-2"
              >
                <ShareIcon className="w-4 mr-2" />
                <span className="mb-0.5">Share</span>
              </button>

              <div className="flex justify-center items-center w-10 h-10 border-2 rounded-lg">
                {token && <WatchingStar token={token} />}
              </div>
            </div>
          </div>
        </div>

        {/* Tablet -- top section of listing page */}
        <div className="hidden md:flex lg:hidden items-start w-full mt-4">
          <div className="w-2/3 flex items-start">
            {listingType === LISTING_TYPE.TWEET ? (
              <ListingContent
                ideaToken={token}
                page="ListingPage"
                urlMetaData={urlMetaData}
                useMetaData={false}
              />
            ) : (
              <>
                {/* This wrapper div combined with object-cover keeps images in correct size */}
                <div className="aspect-[16/9] w-36">
                  {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
                  <img
                    className="rounded-xl h-full object-cover"
                    src={
                      urlMetaData && urlMetaData?.ogImage
                        ? urlMetaData.ogImage
                        : '/gray.svg'
                    }
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="ml-4 text-base font-medium leading-5 truncate z-30">
                  <div>
                    <a
                      href={`/i/${token?.address}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs md:text-base font-bold hover:underline"
                    >
                      {displayName?.substr(
                        0,
                        displayName?.length > 50 ? 50 : displayName?.length
                      ) + (displayName?.length > 50 ? '...' : '')}
                    </a>
                  </div>
                  <a
                    href={token?.url}
                    className="text-xs md:text-sm text-brand-blue hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token?.url.substr(
                      0,
                      token?.url.length > 50 ? 50 : token?.url.length
                    ) + (token?.url.length > 50 ? '...' : '')}
                  </a>
                  <div className="w-96 mt-2 text-xs text-left text-black/[.5] leading-4 whitespace-normal">
                    {urlMetaData &&
                      urlMetaData?.ogDescription &&
                      urlMetaData?.ogDescription.substr(
                        0,
                        urlMetaData?.ogDescription.length > 160
                          ? 160
                          : urlMetaData?.ogDescription.length
                      ) +
                        (urlMetaData?.ogDescription.length > 160 ? '...' : '')}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-1/3 flex flex-col items-end">
            <div className="w-48 mb-2 rounded-lg border-2 flex flex-col divide-y-2">
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Composite Rating</span>
                <span className="font-bold">97</span>
              </div> */}
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Average Rating</span>
                <span className="font-bold">{token?.averageRating}</span>
              </div>
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Comments</span>
                <span className="flex items-center font-bold">
                  <ChatIcon className="w-4 mr-1 mt-0.5" />
                  {token?.latestCommentsCount}
                </span>
              </div>
              {/* <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Market Interest</span>
                <span className="font-bold">$42,693</span>
              </div> */}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-48 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>

            <div className="flex justify-between items-center space-x-2 w-48 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyListingPageURL()
                }}
                className="flex justify-center items-center w-[80%] h-10 border-2 text-black text-base font-medium text-white rounded-lg hover:bg-blue-500 hover:text-white dark:text-gray-300 tracking-tightest-2"
              >
                <ShareIcon className="w-4 mr-2" />
                <span className="mb-0.5">Share</span>
              </button>

              <div className="flex justify-center items-center w-10 h-10 border-2 rounded-lg">
                {token && <WatchingStar token={token} />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile -- top section of listing page */}
        <div className="md:hidden flex flex-col justify-center w-full mt-4">
          <div>
            {listingType === LISTING_TYPE.TWEET ? (
              <ListingContent
                ideaToken={token}
                page="ListingPage"
                urlMetaData={urlMetaData}
                useMetaData={false}
              />
            ) : (
              <>
                {/* This wrapper div combined with object-cover keeps images in correct size */}
                <div className="aspect-[16/9] w-36">
                  {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
                  <img
                    className="rounded-xl h-full object-cover"
                    src={
                      urlMetaData && urlMetaData?.ogImage
                        ? urlMetaData.ogImage
                        : '/gray.svg'
                    }
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="ml-4 text-base font-medium leading-5 truncate z-30">
                  <div>
                    <a
                      href={`/i/${token?.address}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs md:text-base font-bold hover:underline"
                    >
                      {displayName?.substr(
                        0,
                        displayName?.length > 50 ? 50 : displayName?.length
                      ) + (displayName?.length > 50 ? '...' : '')}
                    </a>
                  </div>
                  <a
                    href={token?.url}
                    className="text-xs md:text-sm text-brand-blue hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token?.url.substr(
                      0,
                      token?.url.length > 50 ? 50 : token?.url.length
                    ) + (token?.url.length > 50 ? '...' : '')}
                  </a>
                  <div className="w-96 mt-2 text-xs text-left text-black/[.5] leading-4 whitespace-normal">
                    {urlMetaData &&
                      urlMetaData?.ogDescription &&
                      urlMetaData?.ogDescription.substr(
                        0,
                        urlMetaData?.ogDescription.length > 160
                          ? 160
                          : urlMetaData?.ogDescription.length
                      ) +
                        (urlMetaData?.ogDescription.length > 160 ? '...' : '')}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-end my-10">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-full h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>

            <div className="flex justify-between items-center space-x-2 w-full mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  copyListingPageURL()
                }}
                className="flex justify-center items-center w-[85%] h-10 border-2 text-black text-base font-medium text-white rounded-lg hover:bg-blue-500 hover:text-white dark:text-gray-300 tracking-tightest-2"
              >
                <ShareIcon className="w-4 mr-2" />
                <span className="mb-0.5">Share</span>
              </button>

              <div className="flex justify-center items-center w-10 h-10 border-2 rounded-lg">
                {token && <WatchingStar token={token} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:mt-10 mx-0 md:mx-5 lg:mx-10 pb-20">
        <div className="text-xl text-center text-black font-bold mb-4">
          Ratings
        </div>

        <OpinionTable
          opinionPairs={opinionPairs}
          setNameSearch={setNameSearch}
        />
      </div>

      {/* Block at bottom of mobile screen before scroll */}
      <div
        className={classNames(
          isScrolled ? 'hidden' : 'flex md:hidden',
          // shadow = 1st num is horizontal shadow length. 2nd num is vertical shadow length. 3rd num is blur amount.
          'md:hidden absolute bottom-0 left-0 right-0 flex items-center divide-x h-[12%] bg-white z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'
        )}
      >
        <div className="w-[50%] px-4 py-3 h-full">
          <div className="font-semibold text-sm text-black/[.5]">
            Average Rating
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-semibold text-xl mr-1">
              {token?.averageRating}
            </span>
            <span className="text-sm text-black/[.5]">
              ({token?.latestRatingsCount})
            </span>
          </div>
        </div>

        <div className="w-[50%] px-4 py-3 h-full">
          <div className="font-semibold text-sm text-black/[.5]">Comments</div>
          <div className="flex items-center font-medium">
            <ChatIcon className="w-4 mr-1 mt-0.5" />
            {token?.latestCommentsCount}
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      rawTokenId: context.query.tokenId,
    },
  }
}

TokenDetails.getLayout = (page: ReactElement) => (
  <DefaultLayout bgColor="bg-black/[.05] dark:bg-gray-900">
    {page}
  </DefaultLayout>
)

export default TokenDetails
