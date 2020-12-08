import classNames from 'classnames'
import { useWindowSize } from 'utils'
import { IdeaMarket } from 'store/ideaMarketsStore'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { queryOwnedTokensMaybeMarket } from 'store/ideaMarketsStore'
import { useWalletStore } from 'store/walletStore'
import OwnedTokenRow from './OwnedTokenRow'
import OwnedTokenRowSkeleton from './OwnedTokenRowSkeleton'

type Header = {
  title: string
  value: string
  sortable: boolean
}
const headers: Header[] = [
  {
    title: 'Name',
    value: 'name',
    sortable: true,
  },
  {
    title: 'Market',
    value: 'market',
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
    title: 'Balance',
    value: 'balance',
    sortable: true,
  },
  {
    title: 'Value',
    value: 'value',
    sortable: true,
  },
]

export default function OwnedTokenTable({ market }: { market: IdeaMarket }) {
  const windowSize = useWindowSize()
  const TOKENS_PER_PAGE = windowSize.width < 768 ? 4 : 10

  const address = useWalletStore((state) => state.address)

  const [currentPage, setCurrentPage] = useState(0)
  const [currentHeader, setCurrentHeader] = useState('price')
  const [orderBy, setOrderBy] = useState('supply')
  const [orderDirection, setOrderDirection] = useState('desc')

  const { data: pairs, isLoading: isPairsDataLoading } = useQuery(
    [
      'owned-tokens',
      market,
      address,
      currentPage * TOKENS_PER_PAGE,
      TOKENS_PER_PAGE,
      orderBy,
      orderDirection,
    ],
    queryOwnedTokensMaybeMarket
  )

  const isLoading = isPairsDataLoading

  function headerClicked(headerValue: string) {
    if (currentHeader === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
      } else {
        setOrderDirection('asc')
      }
    } else {
      setCurrentHeader(headerValue)

      if (headerValue === 'name') {
        setOrderBy('name')
      } else if (headerValue === 'price') {
        setOrderBy('supply')
      } else if (headerValue === 'change') {
        setOrderBy('dayChange')
      } else if (headerValue === 'volume') {
        setOrderBy('dayVolume')
      } else if (headerValue === 'locked') {
        setOrderBy('lockedAmount')
      }

      setOrderDirection('desc')
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 sm:rounded-t-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    {headers.map((header) => (
                      <th
                        className={classNames(
                          'px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50',
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
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <OwnedTokenRowSkeleton key={token} />
                    ))
                  ) : (
                    <>
                      {pairs.map((pair) => (
                        <OwnedTokenRow
                          key={pair.token.tokenID}
                          token={pair.token}
                          market={pair.market}
                          balance={pair.balance}
                        />
                      ))}

                      {Array.from(
                        Array(TOKENS_PER_PAGE - (pairs?.length ?? 0))
                      ).map((a, b) => (
                        <tr
                          key={`${'filler-' + b.toString()}`}
                          className="hidden h-18 md:table-row"
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
      <div className="flex flex-row items-stretch justify-between px-10 py-5 md:justify-center md:flex md:border-b md:space-x-10">
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
