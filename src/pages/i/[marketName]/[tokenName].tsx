import { useQuery } from 'react-query'
import { MutualTokensList, DefaultLayout, WalletModal } from 'components'
// import { useWalletStore } from 'store/walletStore'
// import { queryDaiBalance } from 'store/daiStore'
// import { NETWORK } from 'store/networks'
import {
  querySingleToken,
  queryMarket,
  // queryInterestManagerTotalShares,
} from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import { GetServerSideProps } from 'next'
import ModalService from 'components/modals/ModalService'
// import LeftListingPanel from 'components/listing-page/LeftListingPanel'
import ListingStats from 'components/listing-page/ListingStats'
import ListingSEO from 'components/listing-page/ListingSEO'
// import TradeCompleteModal, {
//   TRANSACTION_TYPES,
// } from 'components/trade/TradeCompleteModal'
// import { bnToFloatString, bigNumberTenPow18 } from 'utils'
import { ReactElement, useEffect } from 'react'
import DesktopRelatedInfo from 'components/listing-page/DesktopRelatedInfo'
import MobileRelatedInfo from 'components/listing-page/MobileRelatedInfo'
import InvestmentCalculator from 'components/investment-calculator/InvestmentCalculator'
// import GoogleTrendsPanel from 'components/listing-page/GoogleTrendsPanel'
import WikiRelatedInfo from 'components/listing-page/WikiRelatedInfo'
// import PageViewsPanel from 'components/listing-page/PageViewsPanel'
import MultiChart from 'components/listing-page/MultiChart'
import { GiSharkJaws } from 'react-icons/gi'
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
  EyeIcon,
  LockClosedIcon,
} from '@heroicons/react/outline'
import { useBalance } from 'actions'
import { useWeb3React } from '@web3-react/core'
import { TrendingUpIcon } from '@heroicons/react/solid'

const DetailsSkeleton = () => (
  <div className="w-12 mx-auto bg-gray-400 rounded animate animate-pulse">
    <span className="invisible">A</span>
  </div>
)

export default function TokenDetails({
  rawMarketName,
  rawTokenName,
}: {
  rawMarketName: string
  rawTokenName: string
}) {
  const { account } = useWeb3React()

  const marketSpecifics =
    getMarketSpecificsByMarketNameInURLRepresentation(rawMarketName)
  const marketName = marketSpecifics?.getMarketName()
  const tokenName =
    marketSpecifics?.getTokenNameFromURLRepresentation(rawTokenName)

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [`market-${marketName}`, marketName],
    queryMarket
  )

  const {
    data: token,
    isLoading: isTokenLoading,
    refetch,
  } = useQuery(
    [`token-${marketName}-${tokenName}`, marketName, tokenName],
    querySingleToken
  )

  // const [tradeToggle, setTradeToggle] = useState(false) // Need toggle to reload balances after trade

  const [, ideaTokenBalanceBN] = useBalance(
    token?.address,
    account,
    18,
    true /*tradeToggle*/
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

  const isLoading = isTokenLoading || isMarketLoading /*||
    isInterestManagerTotalSharesLoading ||
    isInterestManagerDaiBalanceLoading*/

  const tokenPrice = isLoading
    ? ''
    : web3BNToFloatString(
        calculateCurrentPriceBN(
          token.rawSupply,
          market.rawBaseCost,
          market.rawPriceRise,
          market.rawHatchTokens
        ),
        bigNumberTenPow18,
        2
      )

  const relatedInfoProps = {
    rawTokenName,
    tokenName,
    marketName,
  }

  // function onTradeComplete(
  //   isSuccess: boolean,
  //   tokenName: string,
  //   transactionType: TRANSACTION_TYPES
  // ) {
  //   refetch()
  //   setTradeToggle(!tradeToggle)
  //   ModalService.open(TradeCompleteModal, {
  //     isSuccess,
  //     tokenName,
  //     marketName,
  //     transactionType,
  //   })
  // }

  useEffect(() => {
    const timeout = setTimeout(
      () => (window as any)?.twttr?.widgets?.load(),
      3000
    ) // Load tweets

    return () => clearTimeout(timeout)
  }, [rawTokenName])

  return (
    <>
      <ListingSEO
        tokenName={tokenName}
        rawMarketName={rawMarketName}
        rawTokenName={rawTokenName}
      />
      {token && (
        <div className="min-h-screen pb-20 bg-brand-gray dark:bg-gray-900 font-inter">
          {/* <ListingStats
            isLoading={isLoading}
            market={market}
            token={token}
            refetch={refetch}
          /> */}
          <div className="absolute top-0 w-full px-4 bg-top-mobile md:bg-top-desktop h-screen z-0">
            {/* TODO: find a better way to add space to top and keep blue background */}
          </div>

          <div className="px-2 pb-5 mx-auto pt-40 transform md:mt-10 -translate-y-30 md:-translate-y-28 max-w-88 md:max-w-304">
            <div className="flex flex-col md:grid md:grid-cols-2 mb-20">
              <div className="relative flex flex-col justify-between bg-white/[.1] h-136 text-white rounded-lg">
                <div className="p-6 overflow-y-scroll">
                  <div className="flex">
                    <GiSharkJaws className="w-8 h-8 mt-1 p-1 rounded-full bg-white/50" />
                    <div className="flex flex-col ml-3">
                      <div className="leading-5">
                        <div className="inline font-medium mr-1">
                          Baby Shark | CoComelon Nursery Rhymes & Kids Songs
                        </div>
                        <span className="inline-block">
                          <span className="font-normal mr-2">on</span>
                          <div className="w-4 h-4 inline-block pt-1 mr-2">
                            {marketSpecifics.getMarketSVGWhite()}
                          </div>
                          <span className="font-semibold">
                            {marketSpecifics.getMarketName().toUpperCase()}
                          </span>
                        </span>
                      </div>

                      <a
                        href={marketSpecifics.getTokenURL(tokenName)}
                        className="text-brand-blue font-normal text-sm mt-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {marketSpecifics.getTokenURL(tokenName)}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mt-4 pl-10 text-sm">
                    <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
                      Ghost Listed by @testing 87 days ago
                    </div>
                    <div className="px-2 py-2 bg-white/[.1] rounded-lg whitespace-nowrap">
                      Listed by @someone 56 days ago
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 pl-10">
                    <button className="bg-white px-4 py-2 flex items-center text-brand-navy rounded-lg">
                      200
                      <TrendingUpIcon className="w-5 ml-1" />
                    </button>
                    <div className="bg-white/[.1] px-4 py-2 flex items-center text-white rounded-lg">
                      <EyeIcon className="w-5 mr-1" />
                      21.2k
                    </div>
                  </div>

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

                <div className="flex items-center bg-white w-full h-20 p-4 rounded-b-lg text-black">
                  <div className="flex flex-col w-1/2">
                    <div className="text-sm opacity-50 font-semibold">
                      YOU OWN
                    </div>
                    <div className="flex items-center font-semibold">
                      {ideaTokenBalanceDisplay} Tokens
                      <div className="text-sm opacity-50 font-medium inline-block ml-1">
                        for this listing
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 items-center w-full w-1/2">
                    <button
                      onClick={() => ModalService.open(WalletModal, {})}
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
                </div>
              </div>

              <div className="p-4 text-white md:ml-5">
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
                      ) : parseFloat(token.marketCap) <= 0.0 ? (
                        <>&mdash;</>
                      ) : (
                        <>{`$${formatNumberWithCommasAsThousandsSerperator(
                          parseInt(token.marketCap)
                        )}`}</>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm opacity-70">Supply</span>
                    <span className="text-base mt-2">
                      {isLoading ? (
                        <DetailsSkeleton />
                      ) : parseFloat(token.supply) <= 0.0 ? (
                        <>&mdash;</>
                      ) : (
                        <>{`${formatNumberWithCommasAsThousandsSerperator(
                          parseInt(token.supply)
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
                        <>{formatNumberInt(token.holders)}</>
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
                            parseFloat(token.dayChange) >= 0.0
                              ? 'text-brand-neon-green dark:text-green-400'
                              : 'text-brand-red dark:text-red-500'
                          }
                        >
                          {formatNumber(token.dayChange)}%
                        </div>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-10">
                  <ListingStats
                    isLoading={isLoading}
                    market={market}
                    token={token}
                    refetch={refetch}
                  />
                </div>

                <div className="p-5 my-8 bg-white text-black border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray">
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
                rawTokenName={rawTokenName}
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
                    rawTokenName={rawTokenName}
                  /> */}
                  <MultiChart rawTokenName={rawTokenName} />
                </div>
                {/* <GoogleTrendsPanel
                  title="Google Trends"
                  rawTokenName={marketSpecifics.getTokenDisplayName(
                    rawTokenName
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
      rawMarketName: context.query.marketName,
      rawTokenName: context.query.tokenName,
    },
  }
}

TokenDetails.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
