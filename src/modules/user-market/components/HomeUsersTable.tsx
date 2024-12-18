import React, {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useInfiniteQuery } from 'react-query'

import { IdeaToken } from 'store/ideaMarketsStore'
import { OverviewColumns } from 'components/tokens/table/OverviewColumns'
import { flatten } from 'utils/lodash'
import { GlobalContext } from 'lib/GlobalContext'
import { SortOptionsHomeUsersTable } from 'utils/tables'
import { getAllUsers } from '../services/UserMarketService'
import HomeUsersRowSkeleton from './HomeUsersRowSkeleton'
import HomeUsersRow from './HomeUsersRow'
import EmptyTableBody from 'modules/tables/components/EmptyTableBody'

type Props = {
  nameSearch: string
  orderBy: string
  orderDirection: string
  columnData: Array<any>
  selectedCategories: string[]
  selectedView: any
  getColumn: (column: string) => boolean
  onOrderByChanged: (o: string, d: string) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  onStakeClicked: (idt: IdeaToken) => void
  tradeOrListSuccessToggle: boolean
  onNameSearchChanged: (value: string) => void
}

export default function HomeUsersTable({
  nameSearch,
  orderBy,
  orderDirection,
  columnData,
  selectedCategories,
  selectedView,
  getColumn,
  onOrderByChanged,
  onRateClicked,
  onStakeClicked,
  tradeOrListSuccessToggle,
  onNameSearchChanged,
}: Props) {
  const TOKENS_PER_PAGE = 10

  const { jwtToken, isTxPending } = useContext(GlobalContext)

  const [currentColumn, setCurrentColumn] = useState('')

  const observer: MutableRefObject<any> = useRef()

  const {
    data: infiniteData,
    isFetching: isTokenDataLoading,
    fetchNextPage: fetchMore,
    refetch,
    hasNextPage: canFetchMore,
  } = useInfiniteQuery(
    [TOKENS_PER_PAGE, orderBy, orderDirection, selectedCategories, nameSearch],
    ({ pageParam = 0 }) =>
      getAllUsers(
        [TOKENS_PER_PAGE, orderBy, orderDirection, nameSearch],
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
      enabled: true,
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
      } else if (
        column === SortOptionsHomeUsersTable.TOTAL_RATINGS_COUNT.value
      ) {
        onOrderByChanged(
          SortOptionsHomeUsersTable.TOTAL_RATINGS_COUNT.value,
          'desc'
        )
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
                selectedView={selectedView}
                isStarredFilterActive={false}
                columnClicked={columnClicked}
                setIsStarredFilterActive={() => null}
                onNameSearchChanged={onNameSearchChanged}
              />
            </div>
            <div className="bg-white divide-y-[6px] dark:bg-gray-700">
              {(tokenData as any[]).map((token, index) => {
                return (
                  <HomeUsersRow
                    key={index}
                    token={token}
                    getColumn={getColumn}
                    onRateClicked={onRateClicked}
                    onStakeClicked={onStakeClicked}
                    refetch={refetch}
                    lastElementRef={
                      tokenData?.length === index + 1 ? lastElementRef : null
                    }
                  />
                )
              })}

              {isLoading
                ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                    <HomeUsersRowSkeleton key={token} getColumn={getColumn} />
                  ))
                : null}

              {tokenData && tokenData.length <= 0 && <EmptyTableBody />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
