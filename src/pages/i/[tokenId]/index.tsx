import { useQuery } from 'react-query'
import {
  MutualTokensList,
  DefaultLayout,
  TradeModal,
  VerifyModal,
  WalletModal,
} from 'components'
// import { useWalletStore } from 'store/walletStore'
// import { queryDaiBalance } from 'store/daiStore'
// import { NETWORK } from 'store/networks'
import {
  queryMarket,
  querySingleToken,
  // queryInterestManagerTotalShares,
} from 'store/ideaMarketsStore'
import { GetServerSideProps } from 'next'
import ModalService from 'components/modals/ModalService'
// import LeftListingPanel from 'components/listing-page/LeftListingPanel'
import ListingStats from 'components/listing-page/ListingStats'
import ListingSEO from 'components/listing-page/ListingSEO'
// import { bnToFloatString, bigNumberTenPow18 } from 'utils'
import { ReactElement, useContext, useEffect, useMemo, useState } from 'react'
import DesktopRelatedInfo from 'components/listing-page/DesktopRelatedInfo'
import MobileRelatedInfo from 'components/listing-page/MobileRelatedInfo'
import InvestmentCalculator from 'components/investment-calculator/InvestmentCalculator'
// import GoogleTrendsPanel from 'components/listing-page/GoogleTrendsPanel'
import WikiRelatedInfo from 'components/listing-page/WikiRelatedInfo'
// import PageViewsPanel from 'components/listing-page/PageViewsPanel'
import MultiChart from 'components/listing-page/MultiChart'
import {
  bigNumberTenPow18,
  calculateCurrentPriceBN,
  formatNumber,
  formatNumberInt,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
} from 'utils'
import {
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  // EyeIcon,
  LockClosedIcon,
} from '@heroicons/react/outline'
import { useBalance } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { useMixPanel } from 'utils/mixPanel'
import { useWalletStore } from 'store/walletStore'
import { GlobalContext } from 'lib/GlobalContext'
import classNames from 'classnames'
import { TrendingUpBlue, TrendingUpGray } from 'assets'
import { deleteUpvoteListing } from 'actions/web2/deleteUpvoteListing'
import { upvoteListing } from 'actions/web2/upvoteListing'
import CreateAccountModal from 'components/account/CreateAccountModal'
import { getSignedInWalletAddress } from 'lib/utils/web3-eth'
import useAuth from 'components/account/useAuth'
import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'

const DetailsSkeleton = () => (
  <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
    <span className="invisible">A</span>
  </div>
)

export default function TokenDetails({ rawTokenId }: { rawTokenId: string }) {
  const { account } = useWeb3React()
  const { jwtToken } = useContext(GlobalContext)

  // const marketSpecifics =
  //   getMarketSpecificsByMarketNameInURLRepresentation(rawMarketName)
  // const marketName = marketSpecifics?.getMarketName()
  // const tokenName =
  //   marketSpecifics?.getTokenNameFromURLRepresentation(rawTokenId)

  const {
    data: token,
    isLoading: isTokenLoading,
    refetch,
  } = useQuery([null, null, null, rawTokenId, jwtToken], querySingleToken)

  const marketName = token?.marketName
  const tokenName = token?.name ? token?.name : token?.url

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [`market-${marketName}`, marketName],
    queryMarket
  )

  const [tradeToggle, setTradeToggle] = useState(false) // Need toggle to reload balances after trade
  const [isLocallyUpvoted, setIsLocallyUpvoted] = useState(token?.upVoted) // Used to make upvoting display instantly and not wait on API
  const [localTotalVotes, setLocalTotalVotes] = useState(token?.totalVotes) // Used to make upvoting display instantly and not wait on API

  const [, ideaTokenBalanceBN] = useBalance(
    token?.address,
    account,
    18,
    tradeToggle
  )

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
  //   ['interest-manager-dai-balance', interestManagerAddress],
  //   queryDaiBalance
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

  const url = token?.url

  const { data: urlMetaData, isLoading: isURLMetaDataLoading } = useQuery(
    [url],
    getURLMetaData
  )

  const isLoading = isTokenLoading || isMarketLoading /*||
    isInterestManagerTotalSharesLoading ||
    isInterestManagerDaiBalanceLoading*/

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

  const relatedInfoProps = {
    rawTokenName: token?.name,
    tokenName,
    marketName,
  }

  const onTradeComplete = () => {
    refetch()
    setTradeToggle(!tradeToggle)
  }

  const { setOnWalletConnectedCallback } = useContext(GlobalContext)

  const onTradeClicked = () => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        ModalService.open(
          TradeModal,
          { ideaToken: token, market },
          onTradeComplete
        )
      })
      ModalService.open(WalletModal)
    } else {
      ModalService.open(
        TradeModal,
        { ideaToken: token, market },
        onTradeComplete
      )
    }
  }

  const { mixpanel } = useMixPanel()

  const onVerifyClicked = () => {
    mixpanel.track('CLAIM_INCOME_STREAM', {
      token: token?.name,
      market: market.name,
    })

    const onClose = () => refetch()
    ModalService.open(VerifyModal, { market, token }, onClose)
  }

  const { loginByWallet } = useAuth()

  const onLoginClicked = async () => {
    if (useWalletStore.getState().web3) {
      const signedWalletAddress = await getSignedInWalletAddress({
        account: useWalletStore.getState().address,
        library: useWalletStore.getState().web3,
      })
      await loginByWallet(signedWalletAddress)
    }
  }

  const onUpvoteClicked = async () => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
        if (!jwtToken) {
          onLoginClicked()
          ModalService.open(CreateAccountModal, {})
          return
        }
      })
      ModalService.open(WalletModal)
    } else {
      // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
      if (!jwtToken) {
        onLoginClicked()
        ModalService.open(CreateAccountModal, {})
        return
      }
    }

    const newUpvoteState = !token?.upVoted
    setIsLocallyUpvoted(newUpvoteState)
    const newTotalVotes = newUpvoteState
      ? token?.totalVotes + 1
      : token?.totalVotes - 1
    setLocalTotalVotes(newTotalVotes)

    let response = null
    if (token?.upVoted) {
      response = await deleteUpvoteListing(token?.listingId, jwtToken)
      mixpanel.track('DELETED_UPVOTE', {
        tokenName: token?.name,
      })
    } else {
      response = await upvoteListing(token?.listingId, jwtToken)
      mixpanel.track('UPVOTE', {
        tokenName: token?.name,
      })
    }

    // If upvote failed, then change local state back
    if (!response) {
      setIsLocallyUpvoted(!newUpvoteState)
      setLocalTotalVotes(token?.totalVotes)
    }

    refetch()
  }

  useEffect(() => {
    const timeout = setTimeout(
      () => (window as any)?.twttr?.widgets?.load(),
      3000
    ) // Load tweets

    return () => clearTimeout(timeout)
  }, [rawTokenId])

  useEffect(() => {
    setIsLocallyUpvoted(token?.upVoted)
    setLocalTotalVotes(token?.totalVotes)
  }, [token])
  const { ghostListedBy, ghostListedAt, onchainListedAt, onchainListedBy } =
    (token || {}) as any

  const timeAfterGhostListedInDays = useMemo(() => {
    if (!ghostListedAt) return null
    const ghostListedAtDate = new Date(ghostListedAt)
    const currentDate = new Date()
    return getTimeDifferenceIndays(ghostListedAtDate, currentDate)
  }, [ghostListedAt])

  const timeAfterOnChainListedInDays = useMemo(() => {
    if (!onchainListedAt) return null
    const onchainListedAtDate = new Date(onchainListedAt)
    const currentDate = new Date()
    return getTimeDifferenceIndays(onchainListedAtDate, currentDate)
  }, [onchainListedAt])

  return (
    <>
      <ListingSEO
        tokenName={tokenName}
        rawMarketName={marketName}
        rawTokenName={rawTokenId}
      />
      {token && (
        <div className="min-h-screen pb-20 bg-theme-blue-1 dark:bg-gray-900 font-inter">
          {/* <ListingStats
            isLoading={isLoading}
            market={market}
            token={token}
            refetch={refetch}
          /> */}

          <div className="px-2 pb-5 mx-auto pt-40 md:pt-24 transform md:mt-10 -translate-y-30 md:-translate-y-28 md:max-w-304">
            <div className="flex flex-col md:grid md:grid-cols-2 mb-20">
              <div className="relative flex flex-col justify-between bg-white/[.1] text-white rounded-lg">
                <div className="p-6">
                  <div className="flex">
                    <div className="flex flex-col">
                      {isURLMetaDataLoading ||
                        (urlMetaData && urlMetaData?.ogTitle && (
                          <div className="inline font-medium mr-1">
                            {isURLMetaDataLoading
                              ? 'Display name loading'
                              : urlMetaData?.ogTitle}
                          </div>
                        ))}

                      <a
                        href={url}
                        className="text-blue-500 font-normal text-sm my-1"
                        style={{ overflowWrap: 'anywhere' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mt-4 text-sm">
                    {ghostListedBy && timeAfterGhostListedInDays ? (
                      <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
                        {`Ghost Listed by @${ghostListedBy} ${timeAfterGhostListedInDays} days ago`}
                      </div>
                    ) : (
                      ``
                    )}
                    {onchainListedBy && timeAfterOnChainListedInDays ? (
                      <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
                        {`Listed by @${onchainListedBy} ${timeAfterOnChainListedInDays} days ago`}
                      </div>
                    ) : (
                      ``
                    )}
                  </div>

                  {marketName === 'Twitter' && (
                    <div className="w-full md:w-auto text-left my-2">
                      {account &&
                        token?.verified &&
                        token?.tokenOwner?.toLowerCase() ===
                          account.toLowerCase() && <span>Verified by you</span>}

                      {!token?.verified && (
                        <button
                          onClick={onVerifyClicked}
                          className="py-2 text-lg font-bold text-white border border-white rounded-lg w-44 font-sf-compact-medium hover:bg-white hover:text-brand-blue"
                        >
                          Verify ownership
                        </button>
                      )}
                    </div>
                  )}

                  {marketName !== 'Wikipedia' && marketName !== 'Twitter' && (
                    // Didn't use Next image because can't do wildcard domain allow in next config file
                    <a
                      href={url}
                      className="cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {isURLMetaDataLoading ||
                        (urlMetaData && urlMetaData?.ogImage && (
                          <img
                            className="rounded-xl mt-4"
                            src={
                              !isURLMetaDataLoading &&
                              urlMetaData &&
                              urlMetaData?.ogImage
                                ? urlMetaData.ogImage
                                : '/gray.svg'
                            }
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      {isURLMetaDataLoading ||
                        (urlMetaData && urlMetaData?.ogDescription && (
                          <div className="my-4 text-gray-300 text-sm leading-5">
                            {!isURLMetaDataLoading &&
                            urlMetaData &&
                            urlMetaData?.ogDescription
                              ? urlMetaData.ogDescription
                              : 'Description loading'}
                          </div>
                        ))}
                    </a>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()

                      onUpvoteClicked()
                    }}
                    className={classNames(
                      isLocallyUpvoted
                        ? 'text-blue-500 bg-blue-100'
                        : 'text-white bg-white/[.1]',
                      'flex justify-center items-center space-x-2 w-20 h-10 text-base font-medium rounded-lg dark:bg-gray-600 dark:text-gray-300 hover:border-2 hover:border-blue-500'
                    )}
                  >
                    <span className="">{localTotalVotes}</span>
                    {isLocallyUpvoted ? (
                      <TrendingUpBlue className="w-4 h-4" />
                    ) : (
                      <TrendingUpGray className="w-4 h-4" />
                    )}
                  </button>

                  {/* <div className="flex items-center space-x-2 mt-4 ">
                    <button className="bg-white px-4 py-2 flex items-center text-brand-navy rounded-lg">
                      200
                      <TrendingUpIcon className="w-5 ml-1" />
                    </button>
                    <div className="bg-white/[.1] px-4 py-2 flex items-center text-white rounded-lg">
                      <EyeIcon className="w-5 mr-1" />
                      21.2k
                    </div>
                  </div> */}

                  {(marketName === 'Wikipedia' || marketName === 'Twitter') && (
                    <div className="mt-2" style={{ height: '400px' }}>
                      {marketName?.toLowerCase() === 'twitter' && (
                        <>
                          <MobileRelatedInfo {...relatedInfoProps} />
                          <DesktopRelatedInfo {...relatedInfoProps} />
                        </>
                      )}
                      {marketName?.toLowerCase() === 'wikipedia' && (
                        <WikiRelatedInfo {...relatedInfoProps} />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center bg-white w-full h-20 p-4 rounded-b-lg text-black z-50">
                  <div className="flex flex-col w-1/2">
                    <div className="text-sm opacity-50 font-semibold">
                      YOU OWN
                    </div>
                    <div className="flex items-center font-semibold">
                      {ideaTokenBalanceDisplay} Tokens
                    </div>
                  </div>

                  {token?.isOnChain && (
                    <div className="flex justify-end space-x-2 items-center w-full w-1/2">
                      <button
                        onClick={onTradeClicked}
                        className="bg-blue-500 px-4 py-2 flex items-center text-white rounded-lg"
                      >
                        <ArrowSmUpIcon className="w-5" />
                        Buy
                      </button>
                      <button className="border px-4 py-2 flex items-center text-black rounded-lg">
                        <ArrowSmDownIcon className="w-5" />
                        Sell
                      </button>
                      <button className="border px-4 py-2 flex items-center text-black rounded-lg">
                        <LockClosedIcon className="w-5" />
                        Lock
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-8 text-white md:ml-5">
                {token?.isOnChain && (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col items-center">
                      <span className="text-sm opacity-70">Price</span>
                      <span className="text-base mt-2">
                        {isLoading ? (
                          <DetailsSkeleton />
                        ) : (
                          <>{'$' + formatNumber(tokenPrice)}</>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm opacity-70">Deposits</span>
                      <span className="text-base mt-2">
                        {isLoading ? (
                          <DetailsSkeleton />
                        ) : parseFloat(token?.marketCap) <= 0.0 ? (
                          <>&mdash;</>
                        ) : (
                          <>{`$${formatNumberWithCommasAsThousandsSerperator(
                            parseInt(token?.marketCap)
                          )}`}</>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm opacity-70">Supply</span>
                      <span className="text-base mt-2">
                        {isLoading ? (
                          <DetailsSkeleton />
                        ) : parseFloat(token?.supply) <= 0.0 ? (
                          <>&mdash;</>
                        ) : (
                          <>{`${formatNumberWithCommasAsThousandsSerperator(
                            parseInt(token?.supply)
                          )}`}</>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm opacity-70">Holders</span>
                      <span className="text-base mt-2">
                        {isLoading ? (
                          <DetailsSkeleton />
                        ) : (
                          <>{formatNumberInt(token?.holders)}</>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-sm opacity-70">24H Change</span>
                      <span className="text-base mt-2 text-red-600">
                        {isLoading ? (
                          <DetailsSkeleton />
                        ) : (
                          <div
                            className={
                              parseFloat(token?.dayChange) >= 0.0
                                ? 'text-brand-neon-green dark:text-green-400'
                                : 'text-brand-red dark:text-red-500'
                            }
                          >
                            {formatNumber(token?.dayChange)}%
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {token?.isOnChain && (
                  <div className="my-10">
                    <ListingStats
                      isLoading={isLoading}
                      market={market}
                      token={token}
                      refetch={refetch}
                    />
                  </div>
                )}

                <div
                  className={
                    (token?.isOnChain && 'my-8',
                    'p-5 bg-white text-black border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray')
                  }
                >
                  <InvestmentCalculator ideaToken={token} market={market} />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-2">
              {/* <LeftListingPanel
                isLoading={isLoading}
                market={market}
                token={token}
                claimableIncome={claimableIncome}
                marketSpecifics={marketSpecifics}
                refetch={refetch}
                rawMarketName={rawMarketName}
                rawTokenId={rawTokenId}
              /> */}
              {/* <div
                className={classNames(
                  !web3 && 'md:overflow-hidden',
                  'relative md:pt-5 md:px-5 mb-5 md:mr-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray'
                )}
              >

                {!web3 && (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-60 z-40 rounded-md flex justify-center items-center">
                    <button
                      onClick={() => {
                        ModalService.open(WalletModal)
                      }}
                      className="w-56 p-4 text-xl text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                    >
                      Connect wallet
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="h-full p-18 md:p-0">loading</div>
                ) : (
                  <div className={classNames(!web3 && 'md:absolute')}>
                    <TradeInterface
                      ideaToken={token}
                      market={market}
                      onTradeComplete={onTradeComplete}
                      onValuesChanged={() => {}}
                      resetOn={false}
                      centerTypeSelection={false}
                      showTypeSelection={true}
                      showTradeButton={true}
                      disabled={false}
                      parentComponent="ListingPage"
                    />
                  </div>
                )}
              </div> */}
              {/* <div className="p-5 mb-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray">
                <InvestmentCalculator ideaToken={token} market={market} />
              </div> */}
            </div>
            {marketName?.toLowerCase() === 'wikipedia' && (
              <div className="flex flex-col">
                <div className="mb-4 md:mb-0">
                  {/* <PageViewsPanel
                    title="Pageviews"
                    rawTokenName={rawTokenId}
                  /> */}
                  <MultiChart rawTokenName={tokenName} />
                </div>
                {/* <GoogleTrendsPanel
                  title="Google Trends"
                  rawTokenName={marketSpecifics.getTokenDisplayName(
                    rawTokenId
                  )}
                /> */}
              </div>
            )}
          </div>

          <div className="px-2 mx-auto max-w-88 md:max-w-304 -mt-30 md:-mt-28">
            {/* {marketName?.toLowerCase() === 'twitter' && (
              <>
                <MobileRelatedInfo {...relatedInfoProps} />
                <DesktopRelatedInfo {...relatedInfoProps} />
              </>
            )}
            {marketName?.toLowerCase() === 'wikipedia' && (
              <WikiRelatedInfo {...relatedInfoProps} />
            )} */}

            {marketName?.toLowerCase() !== 'wikipedia' &&
              marketName?.toLowerCase() !== 'twitter' && (
                <MutualTokensList
                  tokenName={tokenName}
                  marketName={marketName}
                />
              )}
          </div>
        </div>
      )}
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
  <DefaultLayout bgColor="bg-theme-blue-1 dark:bg-gray-900">
    {page}
  </DefaultLayout>
)
