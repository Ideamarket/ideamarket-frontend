import classNames from 'classnames'
import { useEffect, useState, useCallback, useRef, MutableRefObject } from 'react'
import { IdeaTokenTrade } from 'store/ideaMarketsStore'
import { MyTradesRow, MyTradesRowSkeleton } from './components'
import headers from './headers'

type MyTradesTableProps = {
  rawPairs: IdeaTokenTrade[]
  isPairsDataLoading: boolean
  canFetchMore: boolean
  fetchMore: () => any
}

export default function MyTradesTable({
  rawPairs,
  isPairsDataLoading,
  canFetchMore,
  fetchMore,
}: MyTradesTableProps) {
  const TOKENS_PER_PAGE = 10

  const [currentHeader, setCurrentHeader] = useState('date')
  const [orderBy, setOrderBy] = useState('date')
  const [orderDirection, setOrderDirection] = useState('desc')

  const [pairs, setPairs]: [IdeaTokenTrade[], any] = useState([])

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

  useEffect(() => {
    let sorted = [...rawPairs]
    const strCmpFunc =
      orderDirection === 'asc'
        ? (a, b) => {
            return a.localeCompare(b)
          }
        : (a, b) => {
            return b.localeCompare(a)
          }
    const numCmpFunc =
      orderDirection === 'asc'
        ? (a, b) => {
            return a - b
          }
        : (a, b) => {
            return b - a
          }

    if (orderBy === 'type') {
      sorted.sort((lhs: any, rhs: any) => {
        return numCmpFunc(lhs.isBuy, rhs.isBuy)
      })
    } else if (orderBy === 'amount') {
      sorted.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'value') {
      sorted.sort((lhs, rhs) => {
        return numCmpFunc(lhs.daiAmount, rhs.daiAmount)
      })
    } else if (orderBy === 'name') {
      sorted.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'date') {
      sorted.sort((lhs, rhs) => {
        return numCmpFunc(lhs.timestamp, rhs.timestamp)
      })
    }

    setPairs(sorted)
  }, [rawPairs, orderBy, orderDirection, TOKENS_PER_PAGE])

  function headerClicked(headerValue: string) {
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
                {pairs.map((pair: IdeaTokenTrade, index) => (
                  <MyTradesRow
                    key={index}
                    token={pair.token}
                    market={pair.market}
                    rawDaiAmount={pair.rawDaiAmount}
                    isBuy={pair.isBuy}
                    timestamp={pair.timestamp}
                    rawIdeaTokenAmount={pair.rawIdeaTokenAmount}
                    lastElementRef={
                      pairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
                {isPairsDataLoading ? (
                  Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                    <MyTradesRowSkeleton key={token} />
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
