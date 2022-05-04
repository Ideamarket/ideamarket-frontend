import React, {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useInfiniteQuery } from 'react-query'

import { IdeaToken, queryPosts } from 'store/ideaMarketsStore'
import { useIdeaMarketsStore } from 'store/ideaMarketsStore'
import TokenRow from './OverviewTokenRow'
import TokenRowSkeleton from './OverviewTokenRowSkeleton'
import { OverviewColumns } from './table/OverviewColumns'
import { flatten } from 'utils/lodash'
import { GlobalContext } from 'lib/GlobalContext'
import { SortOptionsHomePostsTable } from 'utils/tables'

type Props = {
  isStarredFilterActive: boolean
  nameSearch: string
  orderBy: string
  orderDirection: string
  columnData: Array<any>
  selectedCategories: string[]
  getColumn: (column: string) => boolean
  onOrderByChanged: (o: string, d: string) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  tradeOrListSuccessToggle: boolean
  setIsStarredFilterActive: (isActive: boolean) => void
}

export default function Table({
  isStarredFilterActive,
  nameSearch,
  orderBy,
  orderDirection,
  columnData,
  selectedCategories,
  getColumn,
  onOrderByChanged,
  onRateClicked,
  tradeOrListSuccessToggle,
  setIsStarredFilterActive,
}: Props) {
  const TOKENS_PER_PAGE = 10

  const { jwtToken, isTxPending } = useContext(GlobalContext)

  const [currentColumn, setCurrentColumn] = useState('')

  const observer: MutableRefObject<any> = useRef()

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  const {
    data: infiniteData,
    isFetching: isTokenDataLoading,
    fetchNextPage: fetchMore,
    refetch,
    hasNextPage: canFetchMore,
  } = useInfiniteQuery(
    [
      TOKENS_PER_PAGE,
      orderBy,
      orderDirection,
      selectedCategories,
      filterTokens,
      nameSearch,
    ],
    ({ pageParam = 0 }) =>
      queryPosts(
        [
          TOKENS_PER_PAGE,
          orderBy,
          orderDirection,
          selectedCategories,
          filterTokens,
          nameSearch,
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
    refetch()
  }, [
    isStarredFilterActive,
    filterTokens?.length, // Need this to detect change in starred tokens. Otherwise, you click a star and it shows no tokens if starred filter is on
    orderBy,
    orderDirection,
    nameSearch,
    tradeOrListSuccessToggle,
    refetch,
    jwtToken,
    selectedCategories,
    isTxPending, // If any transaction starts or stop, refresh home table data
  ])

  const isLoading = isTokenDataLoading

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
      } else if (column === SortOptionsHomePostsTable.AVG_RATING.value) {
        onOrderByChanged(SortOptionsHomePostsTable.AVG_RATING.value, 'desc')
      } else if (column === SortOptionsHomePostsTable.COMMENTS.value) {
        onOrderByChanged(SortOptionsHomePostsTable.COMMENTS.value, 'desc')
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
                isStarredFilterActive={isStarredFilterActive}
                columnClicked={columnClicked}
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
