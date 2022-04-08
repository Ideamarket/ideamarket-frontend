import { useQuery, useInfiniteQuery } from 'react-query'
import { A, DefaultLayout, WalletModal, WatchingStar } from 'components'
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
import { StarIcon } from '@heroicons/react/solid'
import { ChatIcon, ShareIcon } from '@heroicons/react/outline'
import { useBalance } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'lib/GlobalContext'
// import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'
import { getMarketSpecificsByMarketName } from 'store/markets'
import ListingContent from 'components/tokens/ListingContent'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import RateModal from 'components/trade/RateModal'
import {
  getListingTypeFromIDTURL,
  LISTING_TYPE,
} from 'components/tokens/utils/ListingUtils'
import useOpinionsByIDTAddress from 'modules/ratings/hooks/useOpinionsByIDTAddress'
import copy from 'copy-to-clipboard'
import { getURL } from 'utils/seo-constants'
import toast from 'react-hot-toast'
import SelectableButton from 'components/buttons/SelectableButton'
import getLatestOpinionsAboutAddress from 'actions/web3/getLatestOpinionsAboutAddress'
import { flatten } from 'lodash'
import { convertAccountName } from 'lib/utils/stringUtil'
import OpinionTable from 'modules/ratings/components/ListingPage/OpinionTable'

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
  enabled: true,  // This apparently decides if data is loaded on page load or not
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

  const { onchainListedAt, onchainListedBy } = (token || {}) as any

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

  // const {
  //   data: interestManagerTotalShares,
  //   isLoading: isInterestManagerTotalSharesLoading,
  // } = useQuery('interest-manager-total-shares', queryInterestManagerTotalShares)

  // const interestManagerAddress = NETWORK.getDeployedAddresses().interestManagerAVM
  // const {
  //   data: interestManagerDaiBalance,
  //   isLoading: isInterestManagerDaiBalanceLoading,
  // } = useQuery(
  //   ['interest-manager-dai-balance',],
  //   () => queryDaiBalance(interestManagerAddress),
  // )

  // const claimableIncome =
  //   interestManagerTotalShares &&
  //   interestManagerDaiBalance &&
  //   token &&
  //   token.rawInvested &&
  //   token.rawMarketCap
  //     ? bnToFloatString(
  //         new BigNumber(token.rawInvested.toString())
  //           .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
  //           .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
  //           .minus(new BigNumber(token.rawMarketCap.toString())),
  //         bigNumberTenPow18,
  //         2
  //       )
  //     : '0.00'

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

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

    return () => clearTimeout(timeout)
  }, [rawTokenId])

  const url = token?.url

  const { data: urlMetaData } = useQuery([url], () => getURLMetaData(url))

  const { avgRating, totalComments } = useOpinionsByIDTAddress(token?.address)

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
  //   mixpanel.track('CLAIM_INCOME_STREAM', {
  //     token: token?.name,
  //     market: market.name,
  //   })

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
                <span className="font-bold">{avgRating}</span>
              </div>
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Comments</span>
                <span className="flex items-center font-bold">
                  <ChatIcon className="w-4 mr-1 mt-0.5" />
                  {totalComments}
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
                <span className="font-bold">{avgRating}</span>
              </div>
              <div className="px-4 py-2 flex items-center">
                <span className="w-1/2 text-xs">Comments</span>
                <span className="flex items-center font-bold">
                  <ChatIcon className="w-4 mr-1 mt-0.5" />
                  {totalComments}
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

        <div className="md:mt-10 pb-20">
          <div className="text-xl text-center text-black font-bold mb-4">Ratings</div>

          <OpinionTable opinionPairs={opinionPairs} setNameSearch={setNameSearch} />

        </div>

      </div>
    </>

    // <>
    //   <ListingSEO
    //     tokenName={tokenName}
    //     rawMarketName={marketName}
    //     rawTokenName={rawTokenId}
    //   />
    //   {token && (
    //     <div className="min-h-screen pb-20 bg-theme-blue-1 dark:bg-gray-900 font-inter">
    //       {/* <ListingStats
    //         isLoading={isLoading}
    //         market={market}
    //         token={token}
    //         refetch={refetch}
    //       /> */}

    //       <div className="px-2 pb-5 mx-auto pt-40 md:pt-24 transform md:mt-10 -translate-y-30 md:-translate-y-28 md:max-w-304">
    //         <div className="flex flex-col md:grid md:grid-cols-2 mb-20">
    //           <div className="relative flex flex-col justify-between bg-white/[.1] text-white rounded-lg">
    //             <div className="p-6 whitespace-normal break-words">
    //               <div className="flex flex-col">
    //                 {isURLMetaDataLoading ||
    //                   (urlMetaData && urlMetaData?.ogTitle && (
    //                     <div className="inline font-medium mr-1">
    //                       {isURLMetaDataLoading
    //                         ? 'Display name loading'
    //                         : urlMetaData?.ogTitle}
    //                     </div>
    //                   ))}

    //                 <a
    //                   href={url}
    //                   className="text-blue-500 font-normal text-sm my-1"
    //                   target="_blank"
    //                   rel="noopener noreferrer"
    //                 >
    //                   {url}
    //                 </a>
    //               </div>

    //               <div className="flex flex-col items-center space-y-1 my-2 text-sm items-baseline">
    //                 {ghostListedBy && timeAfterGhostListedInDays ? (
    //                   <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
    //                     Ghost Listed by{' '}
    //                     <span className="font-bold">
    //                       {convertAccountName(ghostListedBy)}
    //                     </span>{' '}
    //                     {timeAfterGhostListedInDays} days ago
    //                   </div>
    //                 ) : (
    //                   ``
    //                 )}
    //                 {onchainListedBy && timeAfterOnChainListedInDays ? (
    //                   <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
    //                     Listed by{' '}
    //                     <span className="font-bold">
    //                       {convertAccountName(onchainListedBy)}
    //                     </span>{' '}
    //                     {timeAfterOnChainListedInDays} days ago
    //                   </div>
    //                 ) : (
    //                   ``
    //                 )}
    //               </div>

    //               {marketName === 'Twitter' && (
    //                 <div className="w-full md:w-auto text-left my-2">
    //                   {account &&
    //                     token?.verified &&
    //                     token?.tokenOwner?.toLowerCase() ===
    //                       account.toLowerCase() && <span>Verified by you</span>}

    //                   {!token?.verified && (
    //                     <button
    //                       onClick={onVerifyClicked}
    //                       className="py-2 text-lg font-bold text-white border border-white rounded-lg w-44 font-sf-compact-medium hover:bg-white hover:text-brand-blue"
    //                     >
    //                       Verify ownership
    //                     </button>
    //                   )}
    //                 </div>
    //               )}

    //               <button
    //                 onClick={(e) => {
    //                   e.stopPropagation()

    //                   onUpvoteClicked()
    //                 }}
    //                 className={classNames(
    //                   isLocallyUpvoted
    //                     ? 'text-blue-500 bg-blue-100'
    //                     : 'text-white bg-white/[.1]',
    //                   'flex justify-center items-center space-x-2 w-20 h-10 text-base font-medium rounded-lg dark:bg-gray-600 dark:text-gray-300 hover:border-2 hover:border-blue-500'
    //                 )}
    //               >
    //                 <span className="">{localTotalVotes}</span>
    //                 {isLocallyUpvoted ? (
    //                   <TrendingUpBlue className="w-4 h-4" />
    //                 ) : (
    //                   <TrendingUpGray className="w-4 h-4" />
    //                 )}
    //               </button>

    //               {/* <div className="flex items-center space-x-2 mt-4 ">
    //                 <button className="bg-white px-4 py-2 flex items-center text-brand-navy rounded-lg">
    //                   200
    //                   <TrendingUpIcon className="w-5 ml-1" />
    //                 </button>
    //                 <div className="bg-white/[.1] px-4 py-2 flex items-center text-white rounded-lg">
    //                   <EyeIcon className="w-5 mr-1" />
    //                   21.2k
    //                 </div>
    //               </div> */}

    //               <ListingContent
    //                 ideaToken={token}
    //                 page="ListingPage"
    //                 urlMetaData={urlMetaData}
    //               />
    //             </div>

    //             <div className="flex items-center bg-white w-full h-20 p-4 rounded-b-lg text-black z-50">
    //               <div className="flex flex-col w-1/2">
    //                 <div className="text-sm opacity-50 font-semibold">
    //                   YOU OWN
    //                 </div>
    //                 <div className="flex items-center font-semibold">
    //                   {ideaTokenBalanceDisplay} Tokens
    //                 </div>
    //               </div>

    //               {token?.isOnChain && (
    //                 <div className="flex justify-end space-x-2 items-center w-full w-1/2">
    //                   <button
    //                     onClick={() => onTradeClicked(TX_TYPES.BUY)}
    //                     className="bg-blue-500 px-4 py-2 flex items-center text-white rounded-lg"
    //                   >
    //                     <ArrowSmUpIcon className="w-5" />
    //                     Buy
    //                   </button>
    //                   <button
    //                     onClick={() => onTradeClicked(TX_TYPES.SELL)}
    //                     className="border px-4 py-2 flex items-center text-black rounded-lg"
    //                   >
    //                     <ArrowSmDownIcon className="w-5" />
    //                     Sell
    //                   </button>
    //                   <button
    //                     onClick={() => onTradeClicked(TX_TYPES.LOCK)}
    //                     className="border px-4 py-2 flex items-center text-black rounded-lg"
    //                   >
    //                     <LockClosedIcon className="w-5" />
    //                     Lock
    //                   </button>
    //                 </div>
    //               )}
    //             </div>
    //           </div>

    //           <div className="px-4 py-8 text-white md:ml-5">
    //             {token?.isOnChain && (
    //               <div className="flex justify-between items-center w-full">
    //                 <div className="flex flex-col items-center">
    //                   <span className="text-sm opacity-70">Price</span>
    //                   <span className="text-base mt-2">
    //                     {isLoading ? (
    //                       <DetailsSkeleton />
    //                     ) : (
    //                       <>{'$' + formatNumber(tokenPrice)}</>
    //                     )}
    //                   </span>
    //                 </div>
    //                 <div className="flex flex-col items-center">
    //                   <span className="text-sm opacity-70">Deposits</span>
    //                   <span className="text-base mt-2">
    //                     {isLoading ? (
    //                       <DetailsSkeleton />
    //                     ) : parseFloat(token?.marketCap) <= 0.0 ? (
    //                       <>&mdash;</>
    //                     ) : (
    //                       <>{`$${formatNumberWithCommasAsThousandsSerperator(
    //                         parseInt(token?.marketCap)
    //                       )}`}</>
    //                     )}
    //                   </span>
    //                 </div>
    //                 <div className="flex flex-col items-center">
    //                   <span className="text-sm opacity-70">Supply</span>
    //                   <span className="text-base mt-2">
    //                     {isLoading ? (
    //                       <DetailsSkeleton />
    //                     ) : parseFloat(token?.supply) <= 0.0 ? (
    //                       <>&mdash;</>
    //                     ) : (
    //                       <>{`${formatNumberWithCommasAsThousandsSerperator(
    //                         parseInt(token?.supply)
    //                       )}`}</>
    //                     )}
    //                   </span>
    //                 </div>
    //                 <div className="flex flex-col items-center">
    //                   <span className="text-sm opacity-70">Holders</span>
    //                   <span className="text-base mt-2">
    //                     {isLoading ? (
    //                       <DetailsSkeleton />
    //                     ) : (
    //                       <>{formatNumberInt(token?.holders)}</>
    //                     )}
    //                   </span>
    //                 </div>
    //                 <div className="flex flex-col items-center">
    //                   <span className="text-sm opacity-70">24H Change</span>
    //                   <span className="text-base mt-2 text-red-600">
    //                     {isLoading ? (
    //                       <DetailsSkeleton />
    //                     ) : (
    //                       <div
    //                         className={
    //                           parseFloat(token?.dayChange) >= 0.0
    //                             ? 'text-brand-neon-green dark:text-green-400'
    //                             : 'text-brand-red dark:text-red-500'
    //                         }
    //                       >
    //                         {formatNumber(token?.dayChange)}%
    //                       </div>
    //                     )}
    //                   </span>
    //                 </div>
    //               </div>
    //             )}

    //             {token?.isOnChain && (
    //               <div className="my-10">
    //                 <ListingStats
    //                   isLoading={isLoading}
    //                   market={market}
    //                   token={token}
    //                   refetch={refetch}
    //                 />
    //               </div>
    //             )}

    //             <div
    //               className={
    //                 (token?.isOnChain && 'my-8',
    //                 'p-5 bg-white text-black border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray')
    //               }
    //             >
    //               <InvestmentCalculator ideaToken={token} market={market} />
    //             </div>
    //           </div>
    //         </div>

    //         <div className="flex flex-col md:grid md:grid-cols-2">
    //           {/* <LeftListingPanel
    //             isLoading={isLoading}
    //             market={market}
    //             token={token}
    //             claimableIncome={claimableIncome}
    //             marketSpecifics={marketSpecifics}
    //             refetch={refetch}
    //             rawMarketName={rawMarketName}
    //             rawTokenId={rawTokenId}
    //           /> */}
    //         </div>
    //         {marketName?.toLowerCase() === 'wikipedia' && (
    //           <div className="flex flex-col">
    //             <div className="mb-4 md:mb-0">
    //               {/* <PageViewsPanel
    //                 title="Pageviews"
    //                 rawTokenName={rawTokenId}
    //               /> */}
    //               <MultiChart
    //                 rawTokenName={marketSpecifics?.convertUserInputToTokenName(
    //                   token?.name
    //                 )}
    //               />
    //             </div>
    //             {/* <GoogleTrendsPanel
    //               title="Google Trends"
    //               rawTokenName={marketSpecifics.getTokenDisplayName(
    //                 rawTokenId
    //               )}
    //             /> */}
    //           </div>
    //         )}
    //       </div>

    //       <div className="px-2 mx-auto max-w-88 md:max-w-304 truncate -mt-30 md:-mt-28">
    //         {marketName?.toLowerCase() !== 'wikipedia' &&
    //           marketName?.toLowerCase() !== 'twitter' && (
    //             <MutualTokensList
    //               tokenName={tokenName}
    //               marketName={marketName}
    //             />
    //           )}
    //       </div>
    //     </div>
    //   )}
    // </>
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
  <DefaultLayout bgColor="bg-black/[.05] dark:bg-gray-900">{page}</DefaultLayout>
)

export default TokenDetails
