import React, { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import { flatten } from 'lodash'

import { WEEK_SECONDS } from 'utils'
import {
  IdeaToken,
  IdeaMarket,
  queryTokens,
  queryMarkets,
} from 'store/ideaMarketsStore'
import { querySupplyRate, queryExchangeRate } from 'store/compoundStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import { Filters } from 'components/tokens/OverviewFilters'
import { OverviewColumns } from './table/OverviewColumns'

type Props = {
  selectedMarkets: Set<string>
  selectedFilterId: number
  nameSearch: string
  columnData: Array<any>
  getColumn: (column: string) => boolean
  onOrderByChanged: (o: string, d: string) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
  tradeOrListSuccessToggle: boolean
}

export default function Table({
  selectedMarkets,
  selectedFilterId,
  nameSearch,
  columnData,
  getColumn,
  onOrderByChanged,
  onTradeClicked,
  tradeOrListSuccessToggle,
}: Props) {
  const TOKENS_PER_PAGE = 10
  const LOADING_MARGIN = 200

  const [currentColumn, setCurrentColumn] = useState('')
  const [orderBy, setOrderBy] = useState('supply')
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [markets, setMarkets] = useState<IdeaMarket[]>([])
  const canFetchMoreRef = useRef<boolean>()
  const marketsMap = markets.reduce(
    (acc, curr) => ({ ...acc, [curr.marketID]: curr }),
    {}
  )

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens =
    selectedFilterId === Filters.STARRED.id ? watchingTokens : undefined

  const {
    data: compoundExchangeRate,
    isFetching: isCompoundExchangeRateLoading,
  } = useQuery(
    'compound-exchange-rate',
    queryExchangeRate,

    {
      refetchOnWindowFocus: false,
    }
  )

  const { data: compoundSupplyRate, isFetching: isCompoundSupplyRateLoading } =
    useQuery('compound-supply-rate', querySupplyRate, {
      refetchOnWindowFocus: false,
    })

  const { isFetching: isMarketLoading, refetch: refetchMarkets } = useQuery(
    [`market-${Array.from(selectedMarkets)}`, Array.from(selectedMarkets)],
    queryMarkets,
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  )

  const {
    data: infiniteData,
    isFetching: isTokenDataLoading,
    fetchMore,
    refetch,
    canFetchMore,
  } = useInfiniteQuery(
    [
      `tokens-${Array.from(selectedMarkets)}`,
      [
        markets,
        TOKENS_PER_PAGE,
        WEEK_SECONDS,
        selectedFilterId === Filters.HOT.id
          ? 'dayChange'
          : selectedFilterId === Filters.NEW.id
          ? 'listedAt'
          : orderBy,
        selectedFilterId === Filters.HOT.id ||
        selectedFilterId === Filters.NEW.id
          ? 'desc'
          : orderDirection,
        nameSearch,
        filterTokens,
        selectedFilterId === Filters.VERIFIED.id,
      ],
    ],
    queryTokens,
    {
      getFetchMore: (lastGroup, allGroups) => {
        const morePagesExist = lastGroup?.length === 10

        if (!morePagesExist) {
          return false
        }

        return allGroups.length * TOKENS_PER_PAGE
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
    }
  )

  canFetchMoreRef.current = canFetchMore

  const tokenData = flatten(infiniteData || [])

  useEffect(() => {
    const fetch = async () => {
      const markets = await refetchMarkets()
      setMarkets(markets)
    }
    fetch()
  }, [selectedMarkets])

  useEffect(() => {
    if (markets.length !== 0) {
      refetch()
    }
  }, [
    markets,
    selectedFilterId,
    orderBy,
    orderDirection,
    nameSearch,
    tradeOrListSuccessToggle,
  ])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const height = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const diff = height - windowHeight - currentScrollY

      if (diff < LOADING_MARGIN && canFetchMoreRef.current) {
        fetchMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLoading =
    isMarketLoading ||
    isTokenDataLoading ||
    isCompoundSupplyRateLoading ||
    isCompoundExchangeRateLoading

  function columnClicked(column: string) {
    if (currentColumn === column) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
        onOrderByChanged(orderBy, 'desc')
      } else {
        setOrderDirection('asc')
        onOrderByChanged(orderBy, 'asc')
      }
    } else {
      setCurrentColumn(column)

      if (column === 'name') {
        setOrderBy('name')
        onOrderByChanged('name', 'desc')
      } else if (
        column === 'price' ||
        column === 'deposits' ||
        column === 'income'
      ) {
        setOrderBy('supply')
        onOrderByChanged('supply', 'desc')
      } else if (column === 'change') {
        setOrderBy('dayChange')
        onOrderByChanged('dayChange', 'desc')
      } else if (column === 'change') {
        setOrderBy('dayChange')
        onOrderByChanged('dayChange', 'desc')
      } else if (column === 'locked') {
        setOrderBy('lockedPercentage')
        onOrderByChanged('lockedAmount', 'desc')
      } else if (column === 'holders') {
        setOrderBy('holders')
        onOrderByChanged('holders', 'desc')
      } else if (column === 'rank') {
        setOrderBy('rank')
        onOrderByChanged('rank', 'desc')
      }

      setOrderDirection('desc')
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="border-b border-gray-200 dark:border-gray-500 sm:rounded-t-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
                <thead className="hidden md:table-header-group">
                  <tr>
                    <OverviewColumns
                      currentColumn={currentColumn}
                      orderDirection={orderDirection}
                      columnData={columnData}
                      columnClicked={columnClicked}
                    />
                  </tr>
                </thead>
                <tbody className="w-full bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-500">
                  {(tokenData as IdeaToken[]).map((token) => {
                    // Only load the rows if a market is found
                    if (marketsMap[token.marketID]) {
                      return (
                        <TokenRow
                          key={token.marketID + '-' + token.tokenID}
                          token={token}
                          market={marketsMap[token.marketID]}
                          showMarketSVG={false}
                          compoundSupplyRate={compoundSupplyRate}
                          getColumn={getColumn}
                          onTradeClicked={onTradeClicked}
                        />
                      )
                    }
                  })}
                  {isLoading
                    ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                        <TokenRowSkeleton key={token} getColumn={getColumn} />
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
