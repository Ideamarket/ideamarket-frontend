import classNames from 'classnames'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaToken, IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid'
import { SortOptionsAccountPosts } from 'utils/tables'
// import UserPostsRow from './UserPostsRow'
// import UserPostsRowSkeleton from './UserPostsRowSkeleton'
import { Tooltip } from 'components'
import EmptyTableBody from 'modules/tables/components/EmptyTableBody'

type Header = {
  title: string
  value: string
  sortable: boolean
}

const headers: Header[] = [
  {
    title: 'Post',
    value: 'post',
    sortable: false,
  },
  // {
  //   title: 'Bounty Size',
  //   value: 'bountySize',
  //   sortable: true,
  // },
  // {
  //   title: 'Bounty Funders',
  //   value: 'bountyFundersCount',
  //   sortable: true,
  // },
  // {
  //   title: 'Average Rating',
  //   value: SortOptionsAccountPosts.AVG_RATING.value,
  //   sortable: true,
  // },
  {
    title: '',
    value: 'txButtons',
    sortable: false,
  },
]

type UserPostsTableProps = {
  rawPairs: IdeaTokenMarketPair[]
  isPairsDataLoading: boolean
  refetch: () => void
  canFetchMore: boolean
  orderDirection: string
  orderBy: string
  fetchMore: () => any
  headerClicked: (value: string) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
}

export default function ClaimableBountiesTable({
  rawPairs,
  isPairsDataLoading,
  refetch,
  canFetchMore,
  orderDirection,
  orderBy,
  fetchMore,
  headerClicked,
  onRateClicked,
}: UserPostsTableProps) {
  const TOKENS_PER_PAGE = 10

  const observer: MutableRefObject<any> = useRef()
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

  const getColumnContent = (column) => {
    switch (column.value) {
      case SortOptionsAccountPosts.MARKET_INTEREST.value:
        return (
          <div className="flex items-center">
            <span className="mr-1 uppercase break-all">
              {SortOptionsAccountPosts.MARKET_INTEREST.displayName}
            </span>
            <Tooltip
              className="text-black/[.5] z-[200]"
              iconComponentClassNames="w-3"
            >
              <div className="w-64">
                The total amount of IMO staked on all users who rated a post
              </div>
            </Tooltip>
          </div>
        )
      case SortOptionsAccountPosts.COMPOSITE_RATING.value:
        return (
          <div className="flex items-center break-all">
            <span>
              Confidence
              <Tooltip
                className="ml-1 text-black/[.5] z-[200]"
                iconComponentClassNames="w-3"
              >
                <div className="w-64">
                  Rating weighted by IMO staked on each user. The more IMO
                  staked on a user, the more that user’s ratings affect the IMO
                  Rating of every post they rate.
                </div>
              </Tooltip>
            </span>
          </div>
        )
      default:
        return column.title
    }
  }

  const getColumnStyle = (column) => {
    switch (column.value) {
      case 'name':
        return 'w-[45%] lg:w-[55%] pl-6 pr-24'
      case SortOptionsAccountPosts.COMPOSITE_RATING.value:
        return 'w-[13.75%] lg:w-[11.25%]'
      // case SortOptionsAccountPosts.AVG_RATING.value:
      //   return 'w-[11%] lg:w-[9%]'
      case SortOptionsAccountPosts.MARKET_INTEREST.value:
        return 'w-[13.75%] lg:w-[11.25%]'
      case SortOptionsAccountPosts.RATINGS.value:
        return 'w-[13.75%] lg:w-[11.25%]'
      case 'txButtons':
        return 'w-[13.75%] lg:w-[11.25%]'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto">
        <div className="inline-block w-full py-2 align-middle">
          <div className="overflow-hidden dark:border-gray-500">
            <div className="hidden md:flex h-24">
              {headers.map((header) => (
                <div
                  className={classNames(
                    getColumnStyle(header),
                    'flex items-center pr-5 py-5 text-xs leading-4 text-left text-brand-gray-4 dark:text-gray-200 bg-gray-50 dark:bg-gray-600',
                    header.sortable && 'cursor-pointer'
                  )}
                  key={header.value}
                  onClick={() => {
                    if (header.sortable) {
                      headerClicked(header.value)
                    }
                  }}
                >
                  <div className="flex items-center">
                    {rawPairs &&
                      rawPairs?.length > 0 &&
                      header.sortable &&
                      orderBy === header.value && (
                        <div
                          className="h-8 z-[42] text-[.65rem] flex justify-center items-center"
                          title="SORT"
                        >
                          {orderDirection === 'desc' ? (
                            <SortDescendingIcon className="w-3.5 text-blue-500" />
                          ) : (
                            <SortAscendingIcon className="w-3.5 text-blue-500" />
                          )}
                        </div>
                      )}
                    <span className="uppercase font-semibold mr-1">
                      {getColumnContent(header)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="bg-white divide-y-[6px] dark:bg-gray-700">
              {!isPairsDataLoading &&
                rawPairs &&
                rawPairs.map((pair: any, index) => (
                  <UserPostsRow
                    key={index}
                    token={pair}
                    onRateClicked={onRateClicked}
                    refetch={refetch}
                    lastElementRef={
                      rawPairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}

              {isPairsDataLoading
                ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                    <UserPostsRowSkeleton key={token} />
                  ))
                : null}

              {rawPairs && rawPairs.length <= 0 && <EmptyTableBody />}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
