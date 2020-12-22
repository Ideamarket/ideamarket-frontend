import classNames from 'classnames'
import {
  useWindowSize,
  formatNumber,
  bigNumberTenPow18,
  web3BNToFloatString,
} from 'utils'
import {
  IdeaToken,
  IdeaTokenMarketPair,
  IdeaMarket,
  queryMarket,
  queryTokens,
  queryTokensAllMarkets,
} from 'store/ideaMarketsStore'
import { ReactNode, useState } from 'react'
import { useQuery } from 'react-query'
import {
  querySupplyRate,
  queryExchangeRate,
  investmentTokenToUnderlying,
} from 'store/compoundStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import Tooltip from '../tooltip/Tooltip'

type Header = {
  content: ReactNode | string
  value: string
  sortable: boolean
}
const headers: Header[] = [
  {
    content: 'Name',
    value: 'name',
    sortable: true,
  },
  {
    content: 'Price',
    value: 'price',
    sortable: true,
  },
  {
    content: 'Deposits',
    value: 'deposits',
    sortable: true,
  },
  {
    content: '% Locked',
    value: 'locked',
    sortable: true,
  },
  {
    content: '24H Change',
    value: 'change',
    sortable: true,
  },
  {
    content: '24H Volume',
    value: 'volume',
    sortable: true,
  },
  {
    content: (
      <>
        1YR
        <br />
        <div className="flex items-center">
          Income
          <Tooltip className="ml-1">
            <div className="w-32 md:w-64">
              Estimated annual passive income paid to the listing owner.
              Calculated by Deposits * Lending APY at{' '}
              <a
                href="https://compound.finance"
                target="_blank"
                className="underline"
              >
                compound.finance
              </a>
            </div>
          </Tooltip>
        </div>
      </>
    ),
    value: 'income',
    sortable: true,
  },
  {
    content: '7D Chart',
    value: 'chart',
    sortable: false,
  },
]

export default function Table({
  selectedMarketName,
  selectedCategoryId,
  nameSearch,
  currentPage,
  setCurrentPage,
  onOrderByChanged,
  onTradeClicked,
}: {
  selectedMarketName: string
  selectedCategoryId: number
  nameSearch: string
  currentPage: number
  setCurrentPage: (p: number) => void
  onOrderByChanged: (o: string, d: string) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}) {
  const isAllMarkets = selectedMarketName === 'ALL'

  const windowSize = useWindowSize()
  const TOKENS_PER_PAGE = windowSize.width < 768 ? 4 : 10

  const [currentHeader, setCurrentHeader] = useState('price')
  const [orderBy, setOrderBy] = useState('supply')
  const [orderDirection, setOrderDirection] = useState('desc')

  const {
    data: compoundExchangeRate,
    isLoading: isCompoundExchangeRateLoading,
  } = useQuery('compound-exchange-rate', queryExchangeRate)

  const {
    data: compoundSupplyRate,
    isLoading: isCompoundSupplyRateLoading,
  } = useQuery('compound-supply-rate', querySupplyRate)

  const { data: market, isLoading: isMarketLoading } = useQuery(
    [
      `market-${selectedMarketName}`,
      isAllMarkets ? undefined : selectedMarketName,
    ],
    queryMarket
  )

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = selectedCategoryId === 4 ? watchingTokens : undefined

  const {
    data: rowData,
    isLoading: isTokensDataLoading,
  }: {
    data: IdeaToken[] | IdeaTokenMarketPair[]
    isLoading: boolean
  } = useQuery(
    isAllMarkets
      ? [
          'tokens-ALL',
          currentPage * TOKENS_PER_PAGE,
          TOKENS_PER_PAGE,
          selectedCategoryId === 2
            ? 'dayChange'
            : selectedCategoryId === 3
            ? 'listedAt'
            : orderBy,
          selectedCategoryId === 2 || selectedCategoryId === 3
            ? 'desc'
            : orderDirection,
          nameSearch,
          filterTokens,
        ]
      : [
          `tokens-${selectedMarketName}`,
          market,
          currentPage * TOKENS_PER_PAGE,
          TOKENS_PER_PAGE,
          selectedCategoryId === 2
            ? 'dayChange'
            : selectedCategoryId === 3
            ? 'listedAt'
            : orderBy,
          selectedCategoryId === 2 || selectedCategoryId === 3
            ? 'desc'
            : orderDirection,
          nameSearch,
          filterTokens,
        ],
    (isAllMarkets ? queryTokensAllMarkets : queryTokens) as any
  )

  const isLoading =
    isMarketLoading ||
    isTokensDataLoading ||
    isCompoundSupplyRateLoading ||
    isCompoundExchangeRateLoading

  function headerClicked(headerValue: string) {
    setCurrentPage(0)

    if (currentHeader === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
        onOrderByChanged(orderBy, 'desc')
      } else {
        setOrderDirection('asc')
        onOrderByChanged(orderBy, 'asc')
      }
    } else {
      setCurrentHeader(headerValue)

      if (headerValue === 'name') {
        setOrderBy('name')
        onOrderByChanged('name', 'desc')
      } else if (
        headerValue === 'price' ||
        headerValue === 'deposits' ||
        headerValue === 'income'
      ) {
        setOrderBy('supply')
        onOrderByChanged('supply', 'desc')
      } else if (headerValue === 'change') {
        setOrderBy('dayChange')
        onOrderByChanged('dayChange', 'desc')
      } else if (headerValue === 'volume') {
        setOrderBy('dayVolume')
        onOrderByChanged('dayVolume', 'desc')
      } else if (headerValue === 'locked') {
        setOrderBy('lockedPercentage')
        onOrderByChanged('lockedAmount', 'desc')
      }

      setOrderDirection('desc')
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-t-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    {headers.map((header) => (
                      <th
                        className={classNames(
                          'px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50',
                          header.sortable && 'cursor-pointer'
                        )}
                        key={header.value}
                        onClick={() => {
                          if (header.sortable) {
                            headerClicked(header.value)
                          }
                        }}
                      >
                        {header.sortable && (
                          <>
                            {currentHeader === header.value &&
                              orderDirection === 'asc' && <span>&#x25B2;</span>}
                            {currentHeader === header.value &&
                              orderDirection === 'desc' && (
                                <span>&#x25bc;</span>
                              )}
                            &nbsp;
                          </>
                        )}
                        {header.content}
                      </th>
                    ))}
                    <th
                      colSpan={2}
                      className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                    >
                      {!isAllMarkets && !isLoading && (
                        <div className="text-right">
                          {'$' +
                            formatNumber(
                              parseFloat(
                                web3BNToFloatString(
                                  investmentTokenToUnderlying(
                                    market.rawPlatformFeeInvested,
                                    compoundExchangeRate
                                  ).add(market.rawPlatformFeeRedeemed),
                                  bigNumberTenPow18,
                                  4
                                )
                              )
                            )}
                          <br />
                          earned for {market.name}
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <TokenRowSkeleton
                        key={token}
                        showMarketSVG={isAllMarkets}
                      />
                    ))
                  ) : (
                    <>
                      {isAllMarkets
                        ? (rowData as IdeaTokenMarketPair[]).map((pair) => (
                            <TokenRow
                              key={
                                pair.market.marketID + '-' + pair.token.tokenID
                              }
                              token={pair.token}
                              market={pair.market}
                              showMarketSVG={true}
                              compoundSupplyRate={compoundSupplyRate}
                              onTradeClicked={onTradeClicked}
                            />
                          ))
                        : (rowData as IdeaToken[]).map((token) => (
                            <TokenRow
                              key={market.marketID + '-' + token.tokenID}
                              token={token}
                              market={market}
                              showMarketSVG={false}
                              compoundSupplyRate={compoundSupplyRate}
                              onTradeClicked={onTradeClicked}
                            />
                          ))}

                      {Array.from(
                        Array(TOKENS_PER_PAGE - (rowData?.length ?? 0))
                      ).map((a, b) => (
                        <tr
                          key={`${'filler-' + b.toString()}`}
                          className="hidden h-18 md:table-row"
                        ></tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-stretch justify-between px-10 py-5 md:justify-center md:flex md:border-b md:space-x-10">
        <button
          onClick={() => {
            if (currentPage > 0) setCurrentPage(currentPage - 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
            currentPage <= 0
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-brand-gray'
          )}
          disabled={currentPage <= 0}
        >
          &larr; Previous
        </button>
        <button
          onClick={() => {
            if (rowData && rowData.length === TOKENS_PER_PAGE)
              setCurrentPage(currentPage + 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
            rowData?.length !== TOKENS_PER_PAGE
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-brand-gray'
          )}
          disabled={rowData?.length !== TOKENS_PER_PAGE}
        >
          Next &rarr;
        </button>
      </div>
    </>
  )
}
