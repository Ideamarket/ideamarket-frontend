import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { IdeaToken, queryLockedAmounts } from 'store/ideaMarketsStore'
import LockedTokenRowSkeleton from './LockedTokenRowSkeleton'
import LockedTokenRow from './LockedTokenRow'

type Header = {
  title: string
  value: string
  sortable: boolean
}

const headers: Header[] = [
  {
    title: 'Locked until',
    value: 'lockedUntil',
    sortable: true,
  },
  {
    title: 'Amount',
    value: 'amount',
    sortable: true,
  },
]

export default function LockedTokenTable({
  token,
  owner,
}: {
  token: IdeaToken
  owner: string
}) {
  const TOKENS_PER_PAGE = 5

  const [page, setPage] = useState(0)

  const [currentHeader, setCurrentHeader] = useState('lockedUntil')
  const [orderBy, setOrderBy] = useState('lockedUntil')
  const [orderDirection, setOrderDirection] = useState('asc')

  const { data: lockedTokens, isLoading: isLockedTokensLoading } = useQuery(
    [
      'locked-tokens',
      token.address,
      owner,
      page * TOKENS_PER_PAGE,
      TOKENS_PER_PAGE,
      orderBy,
      orderDirection,
    ],
    queryLockedAmounts
  )

  function headerClicked(headerValue: string) {
    setPage(0)
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
                  {isLockedTokensLoading ? (
                    Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <LockedTokenRowSkeleton key={token} />
                    ))
                  ) : (
                    <>
                      {lockedTokens.map((lockedAmount, i) => (
                        <LockedTokenRow key={i} lockedAmount={lockedAmount} />
                      ))}

                      {Array.from(
                        Array(
                          TOKENS_PER_PAGE - (lockedTokens?.length ?? 0) >= 0
                            ? TOKENS_PER_PAGE - (lockedTokens?.length ?? 0)
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
      <div className="flex flex-row items-stretch justify-between px-10 md:justify-center md:flex md:border-b md:space-x-10">
        <button
          onClick={() => {
            if (page > 0) setPage(page - 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
            page <= 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-brand-gray'
          )}
          disabled={page <= 0}
        >
          &larr; Previous
        </button>
        <button
          onClick={() => {
            if (lockedTokens && lockedTokens.length === TOKENS_PER_PAGE)
              setPage(page + 1)
          }}
          className={classNames(
            'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
            lockedTokens?.length !== TOKENS_PER_PAGE
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-brand-gray'
          )}
          disabled={lockedTokens?.length !== TOKENS_PER_PAGE}
        >
          Next &rarr;
        </button>
      </div>
    </>
  )
}
