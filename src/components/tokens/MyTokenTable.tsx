import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import {
  queryMyTokensMaybeMarket,
  IdeaTokenMarketPair,
  IdeaMarket,
} from 'store/ideaMarketsStore'
import { querySupplyRate } from 'store/compoundStore'
import { useWalletStore } from 'store/walletStore'
import MyTokenRow from './MyTokenRow'
import MyTokenRowSkeleton from './MyTokenRowSkeleton'
import { sortNumberByOrder, sortStringByOrder } from './utils'
import TablePagination from './TablePagination'

type Header = {
  title: string
  value: string
  sortable: boolean
}

const headers: Header[] = [
  {
    title: '',
    value: 'market',
    sortable: true,
  },
  {
    title: 'Name',
    value: 'name',
    sortable: true,
  },
  {
    title: 'Price',
    value: 'price',
    sortable: true,
  },
  {
    title: '24H Change',
    value: 'change',
    sortable: true,
  },
  {
    title: '1YR Income',
    value: 'income',
    sortable: true,
  },
]

export default function MyTokenTable({
  market,
  currentPage,
  setCurrentPage,
}: {
  market: IdeaMarket
  currentPage: number
  setCurrentPage: (p: number) => void
}) {
  const TOKENS_PER_PAGE = 6

  const address = useWalletStore((state) => state.address)

  const [currentHeader, setCurrentHeader] = useState('price')
  const [orderBy, setOrderBy] = useState('price')
  const [orderDirection, setOrderDirection] = useState('desc')

  const { data: rawPairs, isLoading: isPairsDataLoading } = useQuery(
    ['my-tokens', market, address],
    queryMyTokensMaybeMarket
  )

  const { data: compoundSupplyRate, isLoading: isCompoundSupplyRateLoading } =
    useQuery('compound-supply-rate', querySupplyRate)

  const [pairs, setPairs]: [IdeaTokenMarketPair[], any] = useState([])

  const isLoading = isPairsDataLoading || isCompoundSupplyRateLoading

  useEffect(() => {
    if (!rawPairs || !compoundSupplyRate) {
      setPairs([])
      return
    }

    let sorted
    const strCmpFunc = sortStringByOrder(orderDirection)
    const numCmpFunc = sortNumberByOrder(orderDirection)

    if (orderBy === 'name') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'market') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.market.name, rhs.market.name)
      })
    } else if (orderBy === 'price' || orderBy === 'income') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(
          parseFloat(lhs.token.supply),
          parseFloat(rhs.token.supply)
        )
      })
    } else if (orderBy === 'change') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(
          parseFloat(lhs.token.dayChange),
          parseFloat(rhs.token.dayChange)
        )
      })
    } else {
      sorted = rawPairs
    }

    const sliced = sorted.slice(
      currentPage * TOKENS_PER_PAGE,
      currentPage * TOKENS_PER_PAGE + TOKENS_PER_PAGE
    )
    setPairs(sliced)
  }, [
    rawPairs,
    orderBy,
    orderDirection,
    currentPage,
    compoundSupplyRate,
    TOKENS_PER_PAGE,
  ])

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
        <div className="-my-2 overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
                <thead className="hidden md:table-header-group">
                  <tr>
                    {headers.map((header) => (
                      <th
                        className={classNames(
                          'px-5 py-4 text-sm font-semibold leading-4 tracking-wider text-left text-brand-gray-4 bg-gray-100 dark:bg-gray-600 dark:text-gray-300',
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
                              orderDirection === 'asc' && (
                                <span className="text-xs">&#x25B2;</span>
                              )}
                            {currentHeader === header.value &&
                              orderDirection === 'desc' && (
                                <span className="text-xs">&#x25bc;</span>
                              )}
                            &nbsp;
                          </>
                        )}
                        {header.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-500">
                  {isLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <MyTokenRowSkeleton key={token} />
                    ))
                  ) : (
                    <>
                      {pairs.map((pair, i) => (
                        <MyTokenRow
                          key={i}
                          token={pair.token}
                          market={pair.market}
                          compoundSupplyRate={compoundSupplyRate}
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
