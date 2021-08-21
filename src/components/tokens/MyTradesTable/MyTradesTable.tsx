import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { IdeaTokenTrade } from 'store/ideaMarketsStore'
import TablePagination from '../TablePagination'
import { sortNumberByOrder, sortStringByOrder } from '../utils'
import { MyTradesRow, MyTradesRowSkeleton } from './components'
import headers from './headers'

type MyTradesTableProps = {
  rawPairs: IdeaTokenTrade[]
  isPairsDataLoading: boolean
  currentPage: number
  setCurrentPage: (p: number) => void
}

export default function MyTradesTable({
  rawPairs,
  isPairsDataLoading,
  currentPage,
  setCurrentPage,
}: MyTradesTableProps) {
  const TOKENS_PER_PAGE = 6

  const [currentHeader, setCurrentHeader] = useState('lockedUntil')
  const [orderBy, setOrderBy] = useState('lockedUntil')
  const [orderDirection, setOrderDirection] = useState('asc')

  const [pairs, setPairs]: [IdeaTokenTrade[], any] = useState([])

  useEffect(() => {
    if (!rawPairs) {
      setPairs([])
      return
    }

    let sorted
    const strCmpFunc = sortStringByOrder(orderDirection)
    const numCmpFunc = sortNumberByOrder(orderDirection)

    if (orderBy === 'type') {
      sorted = rawPairs.sort((lhs: any, rhs: any) => {
        return numCmpFunc(lhs.isBuy, rhs.isBuy)
      })
    } else if (orderBy === 'amount') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'value') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(lhs.daiAmount, rhs.daiAmount)
      })
    } else if (orderBy === 'name') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'date') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(lhs.timestamp, rhs.timestamp)
      })
    } else {
      sorted = rawPairs
    }

    const sliced = sorted.slice(
      currentPage * TOKENS_PER_PAGE,
      currentPage * TOKENS_PER_PAGE + TOKENS_PER_PAGE
    )
    setPairs(sliced)
  }, [rawPairs, orderBy, orderDirection, currentPage, TOKENS_PER_PAGE])

  function headerClicked(headerValue: string) {
    setCurrentPage(0)
    if (currentHeader === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
      } else {
        setOrderDirection('asc')
      }
    } else {
      setCurrentHeader(headerValue)
      setOrderBy(headerValue)
      setOrderDirection('desc')
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
                        {header.sortable && (
                          <>
                            {currentHeader === header.value &&
                              orderDirection === 'asc' && <span>&#x25B2;</span>}
                            {currentHeader === header.value &&
                              orderDirection === 'desc' && (
                                <span>&#x25bc;</span>
                              )}
                            &nbsp;
                          </>
                        )}
                        {header.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700">
                  {isPairsDataLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <MyTradesRowSkeleton key={token} />
                    ))
                  ) : (
                    <>
                      {pairs.map((pair: IdeaTokenTrade, i) => (
                        <MyTradesRow
                          key={pair.token.tokenID + i.toString()}
                          token={pair.token}
                          market={pair.market}
                          rawDaiAmount={pair.rawDaiAmount}
                          isBuy={pair.isBuy}
                          timestamp={pair.timestamp}
                          rawIdeaTokenAmount={pair.rawIdeaTokenAmount}
                        />
                      ))}

                      {Array.from(
                        Array(
                          TOKENS_PER_PAGE - (pairs?.length ?? 0) >= 0
                            ? TOKENS_PER_PAGE - (pairs?.length ?? 0)
                            : 0
                        )
                      ).map((a, b) => (
                        <tr
                          key={`${'filler-' + b.toString()}`}
                          className="hidden h-16 md:table-row"
                        ></tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <TablePagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pairs={pairs}
      />
    </>
  )
}
