import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  MutableRefObject,
} from 'react'
import { LockedIdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { calculateCurrentPriceBN, web3BNToFloatString } from 'utils'
import LockedTokenRowSkeleton from './LockedTokenRowSkeleton'
import LockedTokenRow from './LockedTokenRow'
import { sortNumberByOrder, sortStringByOrder } from './utils'

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
    title: 'Locked Until',
    value: 'lockedUntil',
    sortable: true,
  },
  {
    title: '',
    value: 'metamaskButton',
    sortable: false,
  },
]

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

type LockedTokenTableProps = {
  rawPairs: LockedIdeaTokenMarketPair[]
  isPairsDataLoading: boolean
  canFetchMore: boolean
  fetchMore: () => any
}

export default function LockedTokenTable({
  rawPairs,
  isPairsDataLoading,
  canFetchMore,
  fetchMore,
}: LockedTokenTableProps) {
  const TOKENS_PER_PAGE = 10

  const [currentHeader, setCurrentHeader] = useState('lockedUntil')
  const [orderBy, setOrderBy] = useState('lockedUntil')
  const [orderDirection, setOrderDirection] = useState('asc')

  const [pairs, setPairs]: [LockedIdeaTokenMarketPair[], any] = useState([])

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
    const strCmpFunc = sortStringByOrder(orderDirection)
    const numCmpFunc = sortNumberByOrder(orderDirection)

    if (orderBy === 'name') {
      sorted.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })
    } else if (orderBy === 'market') {
      sorted.sort((lhs, rhs) => {
        return strCmpFunc(lhs.market.name, rhs.market.name)
      })
    } else if (orderBy === 'price') {
      sorted.sort((lhs, rhs) => {
        return numCmpFunc(
          parseFloat(lhs.token.supply),
          parseFloat(rhs.token.supply)
        )
      })
    } else if (orderBy === 'lockedUntil') {
      sorted.sort((lhs, rhs) => {
        return numCmpFunc(lhs.lockedUntil, rhs.lockedUntil)
      })
    } else if (orderBy === 'balance') {
      sorted.sort((lhs, rhs) => {
        return numCmpFunc(parseFloat(lhs.balance), parseFloat(rhs.balance))
      })
    } else if (orderBy === 'value') {
      sorted.sort((lhs, rhs) => {
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
                            orderDirection === 'desc' && <span>&#x25bc;</span>}
                          &nbsp;
                        </>
                      )}
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700">
                {pairs.map((pair, index) => (
                  <LockedTokenRow
                    key={index}
                    token={pair.token}
                    market={pair.market}
                    balance={pair.balance}
                    balanceBN={pair.rawBalance}
                    lockedUntil={pair.lockedUntil}
                    lastElementRef={
                      pairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
                {isPairsDataLoading
                  ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <LockedTokenRowSkeleton key={token} />
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
