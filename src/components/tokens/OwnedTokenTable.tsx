import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { calculateCurrentPriceBN, web3BNToFloatString } from 'utils'
import OwnedTokenRow from './OwnedTokenRow'
import OwnedTokenRowSkeleton from './OwnedTokenRowSkeleton'

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
    title: 'Balance',
    value: 'balance',
    sortable: true,
  },
  {
    title: 'Value',
    value: 'value',
    sortable: true,
  },
  {
    title: '24H Change',
    value: 'change',
    sortable: true,
  },
  {
    title: '',
    value: 'metamaskButton',
    sortable: false,
  },
]

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export default function OwnedTokenTable({
  rawPairs,
  isPairsDataLoading,
  currentPage,
  setCurrentPage,
}: {
  rawPairs: IdeaTokenMarketPair[]
  isPairsDataLoading: boolean
  currentPage: number
  setCurrentPage: (p: number) => void
}) {
  const TOKENS_PER_PAGE = 6

  const [currentHeader, setCurrentHeader] = useState('price')
  const [orderBy, setOrderBy] = useState('price')
  const [orderDirection, setOrderDirection] = useState('desc')

  const [pairs, setPairs]: [IdeaTokenMarketPair[], any] = useState([])

  useEffect(() => {
    if (!rawPairs) {
      setPairs([])
      return
    }

    let sorted
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

    if (orderBy === 'name') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'market') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return strCmpFunc(lhs.market.name, rhs.market.name)
      })
    } else if (orderBy === 'price') {
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
    } else if (orderBy === 'balance') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(parseFloat(lhs.balance), parseFloat(rhs.balance))
      })
    } else if (orderBy === 'value') {
      sorted = rawPairs.sort((lhs, rhs) => {
        const lhsValue =
          parseFloat(
            web3BNToFloatString(
              calculateCurrentPriceBN(
                lhs.token.rawSupply,
                lhs.market.rawBaseCost,
                lhs.market.rawPriceRise,
                lhs.market.rawHatchTokens
              ),
              tenPow18,
              2
            )
          ) * parseFloat(lhs.balance)

        const rhsValue =
          parseFloat(
            web3BNToFloatString(
              calculateCurrentPriceBN(
                rhs.token.rawSupply,
                rhs.market.rawBaseCost,
                rhs.market.rawPriceRise,
                rhs.market.rawHatchTokens
              ),
              tenPow18,
              2
            )
          ) * parseFloat(rhs.balance)

        return numCmpFunc(lhsValue, rhsValue)
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
              <table className="min-w-full divide-y dark:divide-gray-500 divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    {headers.map((header) => (
                      <th
                        className={classNames(
                          'px-5 py-4 text-sm font-semibold leading-4 tracking-wider text-left text-brand-gray-4 dark:text-gray-200 bg-gray-100 dark:bg-gray-600',
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
                  {isPairsDataLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <OwnedTokenRowSkeleton key={token} />
                    ))
                  ) : (
                    <>
                      {pairs.map((pair) => (
                        <OwnedTokenRow
                          key={pair.token.address}
                          token={pair.token}
                          market={pair.market}
                          balance={pair.balance}
                          balanceBN={pair.rawBalance}
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
      <div className="flex flex-row items-stretch justify-between px-10 py-5 md:justify-center md:flex md:space-x-10">
        <button
          onClick={() => {
            if (currentPage > 0) setCurrentPage(currentPage - 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 dark:text-gray-300 tracking-tightest',
            currentPage <= 0
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-brand-gray'
          )}
          disabled={currentPage <= 0}
        >
          &larr; Previous
        </button>
        <button
          onClick={() => {
            if (pairs && pairs.length === TOKENS_PER_PAGE)
              setCurrentPage(currentPage + 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 dark:text-gray-300 tracking-tightest',
            pairs?.length !== TOKENS_PER_PAGE
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-brand-gray'
          )}
          disabled={pairs?.length !== TOKENS_PER_PAGE}
        >
          Next &rarr;
        </button>
      </div>
    </>
  )
}
