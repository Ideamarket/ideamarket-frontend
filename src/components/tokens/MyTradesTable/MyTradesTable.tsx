import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { IdeaTokenTrade } from 'store/ideaMarketsStore'
import {
  bigNumberTenPow18,
  calculateIdeaTokenDaiValue,
  web3BNToFloatString,
} from 'utils'
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

  const [currentHeader, setCurrentHeader] = useState('date')
  const [orderBy, setOrderBy] = useState('date')
  const [orderDirection, setOrderDirection] = useState('desc')

  const [pairs, setPairs]: [IdeaTokenTrade[], any] = useState([])

  useEffect(() => {
    if (!rawPairs) {
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
    } else if (orderBy === 'type') {
      sorted = rawPairs.sort((lhs: any, rhs: any) => {
        return numCmpFunc(lhs.isBuy, rhs.isBuy)
      })
    } else if (orderBy === 'amount') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(lhs.ideaTokenAmount, rhs.ideaTokenAmount)
      })
    } else if (orderBy === 'purchaseValue') {
      sorted = rawPairs.sort((lhs, rhs) => {
        return numCmpFunc(lhs.daiAmount, rhs.daiAmount)
      })
    } else if (orderBy === 'currentValue') {
      sorted = rawPairs.sort((lhs, rhs) => {
        const tokenSupplyLeft = lhs?.isBuy
          ? lhs?.token.rawSupply
          : lhs?.token.rawSupply.add(lhs?.rawIdeaTokenAmount)
        const ideaTokenValueLeft = parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyLeft,
              lhs?.market,
              lhs?.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const tokenSupplyRight = rhs?.isBuy
          ? rhs?.token.rawSupply
          : rhs?.token.rawSupply.add(rhs?.rawIdeaTokenAmount)
        const ideaTokenValueRight = parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyRight,
              rhs?.market,
              rhs?.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        return numCmpFunc(ideaTokenValueLeft, ideaTokenValueRight)
      })
    } else if (orderBy === 'pnl') {
      sorted = rawPairs.sort((lhs, rhs) => {
        const tokenSupplyLeft = lhs?.isBuy
          ? lhs?.token.rawSupply
          : lhs?.token.rawSupply.add(lhs?.rawIdeaTokenAmount)
        const ideaTokenValueLeft = parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyLeft,
              lhs?.market,
              lhs?.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const pnlNumberLeft = ideaTokenValueLeft - lhs.daiAmount
        const pnlPercentageLeft = (pnlNumberLeft / lhs.daiAmount) * 100

        const tokenSupplyRight = rhs?.isBuy
          ? rhs?.token.rawSupply
          : rhs?.token.rawSupply.add(rhs?.rawIdeaTokenAmount)
        const ideaTokenValueRight = parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyRight,
              rhs?.market,
              rhs?.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const pnlNumberRight = ideaTokenValueRight - rhs.daiAmount
        const pnlPercentageRight = (pnlNumberRight / rhs.daiAmount) * 100

        return numCmpFunc(pnlPercentageLeft, pnlPercentageRight)
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
                              {currentHeader === header.value &&
                                orderDirection === 'asc' && (
                                  <span className="mr-1">&#x25B2;</span>
                                )}
                              {currentHeader === header.value &&
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
      <div className="flex flex-row items-stretch justify-between px-10 py-5 md:justify-center md:flex md:space-x-10">
        <button
          onClick={() => {
            if (currentPage > 0) setCurrentPage(currentPage - 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
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
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
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
