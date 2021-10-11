import classNames from 'classnames'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaTokenTrade } from 'store/ideaMarketsStore'
import { MyTradesRowNew, MyTradesRowSkeleton } from './components'
import headers from './headers'

type MyTradesTableProps = {
  rawPairs: IdeaTokenTrade[]
  isPairsDataLoading: boolean
  canFetchMore: boolean
  orderDirection: string
  orderBy: string
  fetchMore: () => any
  headerClicked: (value: string) => void
}

export default function MyTradesTable({
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
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
              <thead className="hidden md:table-header-group">
                <tr>
                  {headers.map((header) => (
                    <th
                      className={classNames(
                        'px-5 py-4 text-sm font-semibold leading-4 tracking-wider text-left text-brand-gray-4 bg-gray-100 dark:bg-gray-600 dark:text-gray-300 bg-gray-50',
                        header.sortable && 'cursor-pointer'
                      )}
                      key={header.value}
                      onClick={() => {
                        if (header.sortable) {
                          headerClicked(header.value)
                        }
                      }}
                    >
                      <div className="flex">
                        {header.sortable && (
                          <>
                            {orderBy === header.value &&
                              orderDirection === 'asc' && (
                                <span className="mr-1">&#x25B2;</span>
                              )}
                            {orderBy === header.value &&
                              orderDirection === 'desc' && (
                                <span className="mr-1">&#x25bc;</span>
                              )}
                          </>
                        )}
                        {header.title}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700">
                {rawPairs.map((pair: IdeaTokenTrade, index) => (
                  <MyTradesRowNew
                    key={index}
                    token={pair.token}
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
