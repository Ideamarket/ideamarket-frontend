import React, {
  MutableRefObject,
  useCallback,
  useContext,
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
import { SortOptions } from './utils/OverviewUtils'
import { flatten } from 'utils/lodash'
import { GlobalContext } from 'lib/GlobalContext'
import ColSize, { TABLE_NAMES } from 'components/tables/ColSize'

type Props = {
  selectedMarkets: Set<string>
  selectedFilterId: number
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isGhostOnlyActive: boolean
  nameSearch: string
  orderBy: string
  orderDirection: string
  columnData: Array<any>
  selectedCategories: string[]
  getColumn: (column: string) => boolean
  onOrderByChanged: (o: string, d: string) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  onMarketChanged: (set: Set<string>) => void
  tradeOrListSuccessToggle: boolean
}

export default function Table({
  selectedMarkets,
  selectedFilterId,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isGhostOnlyActive,
  nameSearch,
  orderBy,
  orderDirection,
  columnData,
  selectedCategories,
  getColumn,
  onOrderByChanged,
  onTradeClicked,
  onRateClicked,
  onMarketChanged,
  tradeOrListSuccessToggle,
}: Props) {
  const TOKENS_PER_PAGE = 10

  const { jwtToken } = useContext(GlobalContext)

  const [currentColumn, setCurrentColumn] = useState('')

  const [markets, setMarkets] = useState<IdeaMarket[]>([])
  const observer: MutableRefObject<any> = useRef()

  const marketsMap = markets?.reduce(
    (acc, curr) => ({ ...acc, [curr.marketID]: curr }),
    {}
  )

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  const { data: compoundSupplyRate, isFetching: isCompoundSupplyRateLoading } =
    useQuery('compound-supply-rate', querySupplyRate, {
      refetchOnWindowFocus: false,
    })

  const { isFetching: isMarketLoading, refetch: refetchMarkets } = useQuery(
    [`market-${Array.from(selectedMarkets)}`],
    () => queryMarkets(Array.from(selectedMarkets)),
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  )

  const {
    data: infiniteData,
    isFetching: isTokenDataLoading,
    fetchNextPage: fetchMore,
    refetch,
    hasNextPage: canFetchMore,
  } = useInfiniteQuery(
    [
      `tokens-${Array.from(selectedMarkets)}`,
      markets,
      TOKENS_PER_PAGE,
      WEEK_SECONDS,
      orderBy,
      selectedFilterId === SortOptions.HOT.id ||
      selectedFilterId === SortOptions.NEW.id
        ? 'desc'
        : orderDirection,
      nameSearch,
      filterTokens,
      isVerifiedFilterActive,
      isGhostOnlyActive ? 'ghost' : 'onchain',
      jwtToken,
      selectedCategories,
    ],
    ({ pageParam = 0 }) =>
      queryTokens(
        [
          markets,
          TOKENS_PER_PAGE,
          WEEK_SECONDS,
          orderBy,
          selectedFilterId === SortOptions.HOT.id ||
          selectedFilterId === SortOptions.NEW.id
            ? 'desc'
            : orderDirection,
          nameSearch,
          filterTokens,
          isVerifiedFilterActive,
          isGhostOnlyActive ? 'ghost' : 'onchain',
          jwtToken,
          selectedCategories,
        ],
        pageParam
      ),
    {
      getNextPageParam: (lastGroup, allGroups) => {
        const morePagesExist = lastGroup?.length === 10

        if (!morePagesExist) {
          return false
        }

        return allGroups.length * TOKENS_PER_PAGE
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
      keepPreviousData: true,
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

  const tokenData = flatten(infiniteData?.pages || [])

  useEffect(() => {
    const fetch = async () => {
      const markets = (await refetchMarkets()) as any
      setMarkets(markets?.data as IdeaMarket[])
    }
    fetch()
  }, [refetchMarkets, selectedMarkets])

  useEffect(() => {
    if (markets && markets?.length !== 0) {
      refetch()
    }
  }, [
    markets,
    selectedFilterId,
    isVerifiedFilterActive,
    isStarredFilterActive,
    filterTokens?.length, // Need this to detect change in starred tokens. Otherwise, you click a star and it shows no tokens if starred filter is on
    orderBy,
    orderDirection,
    nameSearch,
    tradeOrListSuccessToggle,
    isGhostOnlyActive,
    refetch,
    jwtToken,
    selectedCategories,
  ])

  const isLoading =
    isMarketLoading || isTokenDataLoading || isCompoundSupplyRateLoading

  function columnClicked(column: string) {
    if (currentColumn === column) {
      if (orderDirection === 'asc') {
        onOrderByChanged(orderBy, 'desc')
      } else {
        onOrderByChanged(orderBy, 'asc')
      }
    } else {
      setCurrentColumn(column)

      if (column === 'name') {
        onOrderByChanged('name', 'desc')
      } else if (column === 'price') {
        onOrderByChanged('price', 'desc')
      } else if (column === 'deposits') {
        onOrderByChanged('deposits', 'desc')
      } else if (column === 'dayChange') {
        onOrderByChanged('dayChange', 'desc')
      } else if (column === 'weekChange') {
        onOrderByChanged('weekChange', 'desc')
      } else if (column === 'locked') {
        onOrderByChanged('lockedAmount', 'desc')
      } else if (column === 'holders') {
        onOrderByChanged('holders', 'desc')
      } else if (column === 'rank') {
        onOrderByChanged('rank', 'desc')
      } else if (column === 'totalVotes') {
        onOrderByChanged('totalVotes', 'desc')
      }
    }
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto lg:overflow-x-visible">
        <div className="inline-block w-full py-2 align-middle">
          <div className="overflow-x-scroll border-b border-t-4 border-gray-200 dark:border-gray-500 lg:overflow-x-visible">
            {/* table-fixed makes it so mobile table does not overflow and stays width defined here (w-full) */}
            <table className="table-fixed w-full">
              <ColSize columnData={columnData} tableName={TABLE_NAMES.HOME} />

              <thead className="hidden h-24 md:table-header-group border-b-4">
                <tr className="z-40 lg:sticky md:top-28 sticky-safari">
                  <OverviewColumns
                    currentColumn={orderBy}
                    orderDirection={orderDirection}
                    columnData={columnData}
                    selectedMarkets={selectedMarkets}
                    columnClicked={columnClicked}
                    onMarketChanged={onMarketChanged}
                  />
                </tr>
              </thead>
              <tbody className="w-full bg-white divide-y-4 divide-black/[0.05] dark:bg-gray-700 dark:divide-gray-500">
                {(tokenData as any[]).map((token, index) => {
                  const marketID = token?.marketID
                  if (
                    isStarredFilterActive &&
                    filterTokens &&
                    filterTokens?.length <= 0
                  ) {
                    // If starred filter is active, but no starred tokens, then show none. Have to do this because passing nothing to API causes it to fetch all tokens
                    return null
                  }
                  // Only load the rows if a market is found and 2nd condition
                  if (marketsMap[marketID]) {
                    return (
                      <TokenRow
                        key={index}
                        token={token}
                        market={marketsMap[marketID]}
                        showMarketSVG={false}
                        compoundSupplyRate={compoundSupplyRate}
                        getColumn={getColumn}
                        onTradeClicked={onTradeClicked}
                        onRateClicked={onRateClicked}
                        refetch={refetch}
                        lastElementRef={
                          tokenData?.length === index + 1
                            ? lastElementRef
                            : null
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
