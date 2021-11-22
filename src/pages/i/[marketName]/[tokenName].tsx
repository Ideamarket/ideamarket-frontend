import { useQuery } from 'react-query'
import {
  TradeInterface,
  MutualTokensList,
  DefaultLayout,
  WalletModal,
} from 'components'
import { useWalletStore } from 'store/walletStore'
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
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'
// import { bnToFloatString, bigNumberTenPow18 } from 'utils'
import { ReactElement, useEffect } from 'react'
import DesktopRelatedInfo from 'components/listing-page/DesktopRelatedInfo'
import MobileRelatedInfo from 'components/listing-page/MobileRelatedInfo'
import InvestmentCalculator from 'components/investment-calculator/InvestmentCalculator'
import { getData } from 'lib/utils/fetch'
import getSsrBaseUrl from 'utils/getSsrBaseUrl'
import GoogleTrendsPanel from 'components/listing-page/GoogleTrendsPanel'
import WikiRelatedInfo from 'components/listing-page/WikiRelatedInfo'
import PageViewsPanel from 'components/listing-page/PageViewsPanel'
import WatchingStar from 'components/WatchingStar'

export default function TokenDetails({
  rawMarketName,
  rawTokenName,
  dontRender,
}: {
  rawMarketName: string
  rawTokenName: string
  dontRender: boolean
}) {
  const web3 = useWalletStore((state) => state.web3)

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

  // const {
  //   data: interestManagerTotalShares,
  //   isLoading: isInterestManagerTotalSharesLoading,
  // } = useQuery('interest-manager-total-shares', queryInterestManagerTotalShares)

  // const interestManagerAddress = NETWORK.getDeployedAddresses().interestManager
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
  //   token.rawDaiInToken
  //     ? bnToFloatString(
  //         new BigNumber(token.rawInvested.toString())
  //           .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
  //           .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
  //           .minus(new BigNumber(token.rawDaiInToken.toString())),
  //         bigNumberTenPow18,
  //         2
  //       )
  //     : '0.00'

  const isLoading = isTokenLoading || isMarketLoading /*||
    isInterestManagerTotalSharesLoading ||
    isInterestManagerDaiBalanceLoading*/

  const relatedInfoProps = {
    rawTokenName,
    tokenName,
    marketName,
  }

  function onTradeComplete(
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES
  ) {
    refetch()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      marketName,
      transactionType,
    })
  }

  useEffect(() => {
    const timeout = setTimeout(
      () => (window as any)?.twttr?.widgets?.load(),
      3000
    ) // Load tweets

    return () => clearTimeout(timeout)
  }, [rawTokenName])

  if (dontRender) {
    return <div>{rawMarketName} market not currently on Ideamarket</div>
  }

  return (
    <>
      <ListingSEO
        tokenName={tokenName}
        rawMarketName={rawMarketName}
        rawTokenName={rawTokenName}
      />
      {token && (
        <div className="min-h-screen pb-20 bg-brand-gray dark:bg-gray-900">
          <ListingStats
            isLoading={isLoading}
            market={market}
            token={token}
            refetch={refetch}
          />

          <div className="px-2 pb-5 mx-auto mt-12 transform md:mt-10 -translate-y-30 md:-translate-y-28 max-w-88 md:max-w-304">
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
              <div className="p-5 mb-5 md:mr-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray">
                {/* <div className="relative">
                  <WatchingStar
                    className="absolute top-0 right-0"
                    token={token}
                  />
                </div> */}

                {isLoading ? (
                  <div className="h-full p-18 md:p-0">loading</div>
                ) : web3 ? (
                  <div>
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
                    />
                  </div>
                ) : (
                  <div className="flex justify-center p-18 md:p-0 md:mt-20">
                    <button
                      onClick={() => {
                        ModalService.open(WalletModal)
                      }}
                      className="w-44 p-2.5 text-xl text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                    >
                      Buy / Sell
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 mb-5 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray">
                <InvestmentCalculator ideaToken={token} market={market} />
              </div>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-2">
              <div className="mb-4 md:mr-5 md:mb-0">
                <PageViewsPanel title="Pageviews" rawTokenName={rawTokenName} />
              </div>
              <GoogleTrendsPanel
                title="Google Trends"
                rawTokenName={rawTokenName}
              />
            </div>
          </div>

          <div className="px-2 mx-auto max-w-88 md:max-w-304 -mt-30 md:-mt-28">
            {/* {marketName?.toLowerCase() === 'twitter' ? (
              <>
                <MobileRelatedInfo {...relatedInfoProps} />
                <DesktopRelatedInfo {...relatedInfoProps} />
              </>
            ) : (
              <MutualTokensList tokenName={tokenName} marketName={marketName} />
            )} */}
            {marketName?.toLowerCase() === 'twitter' ? (
              <WikiRelatedInfo {...relatedInfoProps} />
            ) : (
              <MutualTokensList tokenName={tokenName} marketName={marketName} />
            )}

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
  // TODO: once feature switch is no longer needed for Minds and Wiki, comment these out until next market launch
  const baseUrl = getSsrBaseUrl(context.req)
  const { data: mindsFeature } = await getData({
    url: `${baseUrl}/api/fs?value=MINDS`,
  })
  const { data: wikiFeature } = await getData({
    url: `${baseUrl}/api/fs?value=WIKIPEDIA`,
  })

  return {
    props: {
      rawMarketName: context.query.marketName,
      rawTokenName: context.query.tokenName,
      dontRender:
        ((context.query.marketName as any).toLowerCase() === 'minds' &&
          !mindsFeature.enabled) ||
        ((context.query.marketName as any).toLowerCase() === 'wikipedia' &&
          !wikiFeature.enabled),
    },
  }
}

TokenDetails.getLayout = (page: ReactElement) => (
  <DefaultLayout>{page}</DefaultLayout>
)
