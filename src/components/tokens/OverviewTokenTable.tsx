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
  queryMarkets,
  queryPosts,
} from 'store/ideaMarketsStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import { OverviewColumns } from './table/OverviewColumns'
import { flatten } from 'utils/lodash'
import { GlobalContext } from 'lib/GlobalContext'
import { SortOptionsHomeTable } from 'utils/tables'

type Props = {
  selectedMarkets: Set<string>
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
  setIsStarredFilterActive: (isActive: boolean) => void
}

export default function Table({
  selectedMarkets,
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
  setIsStarredFilterActive,
}: Props) {
  const TOKENS_PER_PAGE = 10

  const { jwtToken, isTxPending } = useContext(GlobalContext)

  const [currentColumn, setCurrentColumn] = useState('')

  const [markets, setMarkets] = useState<IdeaMarket[]>([])
  const observer: MutableRefObject<any> = useRef()

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

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
      orderDirection,
      nameSearch,
      filterTokens,
      isVerifiedFilterActive,
      isGhostOnlyActive ? 'ghost' : 'onchain',
      jwtToken,
      selectedCategories,
    ],
    ({ pageParam = 0 }) =>
      queryPosts(
        [
          markets,
          TOKENS_PER_PAGE,
          WEEK_SECONDS,
          orderBy,
          orderDirection,
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
    isTxPending,  // If any transaction starts or stop, refresh home table data
  ])

  const isLoading =
    isMarketLoading || isTokenDataLoading

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
      } else if (column === SortOptionsHomeTable.AVG_RATING.value) {
        onOrderByChanged(SortOptionsHomeTable.AVG_RATING.value, 'desc')
      } else if (column === SortOptionsHomeTable.COMMENTS.value) {
        onOrderByChanged(SortOptionsHomeTable.COMMENTS.value, 'desc')
      }
    }
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto">
        <div className="inline-block w-full py-2 align-middle">
          <div className="overflow-hidden dark:border-gray-500">
            <div className="hidden md:flex h-24">
              <OverviewColumns
                orderBy={orderBy}
                orderDirection={orderDirection}
                columnData={columnData}
                selectedMarkets={selectedMarkets}
                isStarredFilterActive={isStarredFilterActive}
                columnClicked={columnClicked}
                onMarketChanged={onMarketChanged}
                setIsStarredFilterActive={setIsStarredFilterActive}
              />
            </div>
            <div className="bg-white divide-y-[6px] dark:bg-gray-700">
              {(tokenData as any[]).map((token, index) => {
                if (
                  isStarredFilterActive &&
                  filterTokens &&
                  filterTokens?.length <= 0
                ) {
                  // If starred filter is active, but no starred tokens, then show none. Have to do this because passing nothing to API causes it to fetch all tokens
                  return null
                }

                return (
                  <TokenRow
                    key={index}
                    token={token}
                    getColumn={getColumn}
                    onTradeClicked={onTradeClicked}
                    onRateClicked={onRateClicked}
                    refetch={refetch}
                    lastElementRef={
                      tokenData?.length === index + 1 ? lastElementRef : null
                    }
                  />
                )
              })}
              {isLoading
                ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                    <TokenRowSkeleton key={token} getColumn={getColumn} />
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
