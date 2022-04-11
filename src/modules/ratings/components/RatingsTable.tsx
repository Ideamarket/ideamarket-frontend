import classNames from 'classnames'
// import { Tooltip } from 'components'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaToken, IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid'
import RatingsRow from './RatingsRow'
import RatingsRowSkeleton from './RatingsRowSkeleton'

type Header = {
  title: string
  value: string
  sortable: boolean
}

const headers: Header[] = [
  {
    title: '',
    value: 'name',
    sortable: true,
  },
  {
    title: 'Rating By User',
    value: 'userRating',
    sortable: true,
  },
  // {
  //   title: 'Composite Rating',
  //   value: 'compositeRating',
  //   sortable: true,
  // },
  {
    title: 'Average Rating',
    value: 'avgRating',
    sortable: true,
  },
  // {
  //   title: 'Market Interest',
  //   value: 'marketInterest',
  //   sortable: true,
  // },
  {
    title: 'Rate',
    value: 'rateButton',
    sortable: false,
  },
]

type RatingsTableProps = {
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

export default function RatingsTable({
  rawPairs,
  isPairsDataLoading,
  refetch,
  canFetchMore,
  orderDirection,
  orderBy,
  fetchMore,
  headerClicked,
  onRateClicked,
}: RatingsTableProps) {
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
      default:
        return column.title
    }
  }

  const getColumnStyle = (column) => {
    switch (column.value) {
      case 'name':
        return 'w-[40%] pl-6 pr-24'
      case 'userRating':
        return 'w-[20%]'
      // case 'compositeRating':
      //   return 'w-[12%]'
      case 'avgRating':
        return 'w-[20%]'
      // case 'marketInterest':
      //   return 'w-[12%]'
      case 'rateButton':
        return 'w-[20%]'
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
                    <span className="uppercase mr-1">
                      {getColumnContent(header)}
                    </span>
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
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white divide-y-[6px] dark:bg-gray-700">
              {!isPairsDataLoading &&
                rawPairs &&
                rawPairs.map((pair: any, index) => (
                  <RatingsRow
                    key={index}
                    ideaToken={pair.idt}
                    opinion={pair.opinion}
                    onRateClicked={onRateClicked}
                    refetch={refetch}
                    lastElementRef={
                      rawPairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
              {isPairsDataLoading
                ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                    <RatingsRowSkeleton key={token} />
                  ))
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
