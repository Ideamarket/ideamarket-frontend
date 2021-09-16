import { useQuery } from 'react-query'
import {
  TradeInterface,
  MutualTokensList,
  DefaultLayout,
  WalletModal,
} from 'components'
import { queryExchangeRate } from 'store/compoundStore'
import { useWalletStore } from 'store/walletStore'
import { querySingleToken, queryMarket } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketNameInURLRepresentation } from 'store/markets'
import { GetServerSideProps } from 'next'
import ModalService from 'components/modals/ModalService'
import LeftListingPanel from 'components/listing-page/LeftListingPanel'
import ListingStats from 'components/listing-page/ListingStats'
import ListingSEO from 'components/listing-page/ListingSEO'
import TradeCompleteModal, {
  TRANSACTION_TYPES,
} from 'components/trade/TradeCompleteModal'

export default function TokenDetails({
  rawMarketName,
  rawTokenName,
}: {
  rawMarketName: string
  rawTokenName: string
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

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate)

  const isLoading =
    isTokenLoading || isMarketLoading || isCompoundExchangeRateLoading

  function onTradeComplete(
    isSuccess: boolean,
    tokenName: string,
    transactionType: TRANSACTION_TYPES
  ) {
    refetch()
    ModalService.open(TradeCompleteModal, {
      isSuccess,
      tokenName,
      transactionType,
    })
  }

  return (
    <>
      <ListingSEO
        tokenName={tokenName}
        rawMarketName={rawMarketName}
        rawTokenName={rawTokenName}
      />
      {token && (
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 pb-20">
          <ListingStats isLoading={isLoading} market={market} token={token} />

          <div className="px-2 pb-5 mx-auto mt-12 transform md:mt-10 -translate-y-30 md:-translate-y-28 max-w-88 md:max-w-304">
            <div className="flex flex-col md:grid md:grid-cols-2">
              <LeftListingPanel
                isLoading={isLoading}
                market={market}
                token={token}
                compoundExchangeRate={compoundExchangeRate}
                marketSpecifics={marketSpecifics}
                refetch={refetch}
                rawMarketName={rawMarketName}
                rawTokenName={rawTokenName}
              />
              <div className="p-5 mb-5 bg-white dark:bg-gray-700 dark:border-gray-500 border rounded-md border-brand-border-gray">
                {isLoading ? (
                  <div className="h-full p-18 md:p-0">loading</div>
                ) : web3 ? (
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
            </div>
          </div>
          <div className="px-2 mx-auto max-w-88 md:max-w-304 -mt-30 md:-mt-28">
            {marketName?.toLowerCase() === 'twitter' ? (
              <div className="flex">
                <div className="w-1/2 mr-5">
                  <div className="md:h-20 pb-5 mb-12 border-b border-gray-200 sm:flex sm:items-end sm:justify-between">
                    <h3 className="text-2xl font-medium leading-6">
                      Latest tweets
                    </h3>
                  </div>
                  <a
                    className="twitter-timeline"
                    href={`https://twitter.com/${rawTokenName}`}
                  >
                    Tweets by {tokenName}
                  </a>
                </div>
                <div className="w-1/2 ml-5">
                  <MutualTokensList
                    tokenName={tokenName}
                    marketName={marketName}
                  />
                </div>
              </div>
            ) : (
              <MutualTokensList tokenName={tokenName} marketName={marketName} />
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

TokenDetails.layoutProps = {
  Layout: DefaultLayout,
}
