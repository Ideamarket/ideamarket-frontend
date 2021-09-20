import classNames from 'classnames'
import {
  useState,
  useCallback,
  useRef,
  MutableRefObject,
  useEffect,
} from 'react'
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
