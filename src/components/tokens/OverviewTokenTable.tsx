import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'

import { WEEK_SECONDS } from 'utils'
import {
  IdeaToken,
  IdeaMarket,
  queryTokens,
  queryMarkets,
} from 'store/ideaMarketsStore'
import { querySupplyRate } from 'store/compoundStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import { OverviewColumns } from './table/OverviewColumns'
import { MainFilters } from './utils/OverviewUtils'
import { flatten } from 'utils/lodash'

type Props = {
  selectedMarkets: Set<string>
  selectedFilterId: number
  isVerifiedFilterActive: boolean
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
  isVerifiedFilterActive,
  nameSearch,
  columnData,
  getColumn,
  onOrderByChanged,
  onTradeClicked,
  tradeOrListSuccessToggle,
}: Props) {
  const TOKENS_PER_PAGE = 10

  const [currentColumn, setCurrentColumn] = useState('')
  const [orderBy, setOrderBy] = useState('supply')
  const [orderDirection, setOrderDirection] = useState<'desc' | 'asc'>('desc')
  const [markets, setMarkets] = useState<IdeaMarket[]>([])
  const observer: MutableRefObject<any> = useRef()

  const marketsMap = markets.reduce(
    (acc, curr) => ({ ...acc, [curr.marketID]: curr }),
    {}
  )

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens =
    selectedFilterId === MainFilters.STARRED.id ? watchingTokens : undefined

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
        selectedFilterId === MainFilters.HOT.id
          ? 'dayChange'
          : selectedFilterId === MainFilters.NEW.id
          ? 'listedAt'
          : orderBy,
        selectedFilterId === MainFilters.HOT.id ||
        selectedFilterId === MainFilters.NEW.id
          ? 'desc'
          : orderDirection,
        nameSearch,
        filterTokens,
        isVerifiedFilterActive,
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

  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canFetchMore) {
          fetchMore()
        }
      })

      if (node) observer.current.observe(node)
    },
    [canFetchMore, fetchMore]
  )

  const tokenData = flatten(infiniteData || [])

  useEffect(() => {
    const fetch = async () => {
      const markets = await refetchMarkets()
      setMarkets(markets)
    }
    fetch()
  }, [refetchMarkets, selectedMarkets])

  useEffect(() => {
    if (markets.length !== 0) {
      refetch()
    }
  }, [
    markets,
    selectedFilterId,
    isVerifiedFilterActive,
    orderBy,
    orderDirection,
    nameSearch,
    tradeOrListSuccessToggle,
    refetch,
  ])

  const isLoading =
    isMarketLoading || isTokenDataLoading || isCompoundSupplyRateLoading

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
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto lg:overflow-x-visible">
        <div className="inline-block w-full py-2 align-middle">
          <div className="overflow-x-scroll border-b border-gray-200 dark:border-gray-500 sm:rounded-t-lg lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
              <thead className="hidden md:table-header-group">
                <tr className="z-10 lg:sticky md:top-28 sticky-safari">
                  <OverviewColumns
                    currentColumn={currentColumn}
                    orderDirection={orderDirection}
                    columnData={columnData}
                    columnClicked={columnClicked}
                    markets={markets}
                  />
                </tr>
              </thead>
              <tbody className="w-full bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-500">
                {(tokenData as IdeaToken[]).map((token, index) => {
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
                        lastElementRef={
                          tokenData.length === index + 1 ? lastElementRef : null
                        }
                      />
                    )
                  }

                  return null
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
  )
}
