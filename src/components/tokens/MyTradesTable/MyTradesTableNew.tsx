import classNames from 'classnames'
import ColSize from 'components/tables/ColSize'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaTokenTrade } from 'store/ideaMarketsStore'
import { MyTradesRowNew, MyTradesRowSkeleton } from './components'
import headers from './headers'
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid'
import { TABLE_NAMES } from 'utils/tables'

type MyTradesTableProps = {
  rawPairs: IdeaTokenTrade[]
  isPairsDataLoading: boolean
  canFetchMore: boolean
  orderDirection: string
  orderBy: string
  fetchMore: () => any
  headerClicked: (value: string) => void
}

export default function MyTradesTableNew({
  rawPairs,
  isPairsDataLoading,
  canFetchMore,
  orderDirection,
  orderBy,
  fetchMore,
  headerClicked,
}: MyTradesTableProps) {
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

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="overflow-hidden dark:border-gray-500">
            <table className="table-fixed w-full divide-y divide-gray-200 dark:divide-gray-500">
              <ColSize
                columnData={headers}
                tableName={TABLE_NAMES.ACCOUNT_TRADES}
              />

              <thead className="hidden h-24 md:table-header-group">
                <tr>
                  {headers.map((header) => (
                    <th
                      className={classNames(
                        'px-4 py-4 text-xs leading-4 text-left text-brand-gray-4 bg-gray-50 dark:bg-gray-600 dark:text-gray-300 bg-gray-50',
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
                        <span className="uppercase mr-1">{header.title}</span>
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
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700">
                {rawPairs.map((pair: IdeaTokenTrade, index) => (
                  <MyTradesRowNew
                    key={index}
                    ideaToken={pair.token}
                    market={pair.market}
                    rawDaiAmount={pair.rawDaiAmount}
                    isBuy={pair.isBuy}
                    timestamp={pair.timestamp}
                    rawIdeaTokenAmount={pair.rawIdeaTokenAmount}
                    lastElementRef={
                      rawPairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
                {isPairsDataLoading
                  ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <MyTradesRowSkeleton key={token} />
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
