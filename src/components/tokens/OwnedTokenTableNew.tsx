import classNames from 'classnames'
import { Tooltip } from 'components'
import A from 'components/A'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import OwnedTokenRowNew from './OwnedTokenRowNew'
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
    value: 'lockButton',
    sortable: false,
  },
  {
    title: 'Transfer',
    value: 'giftButton',
    sortable: false,
  },
]

type OwnedTokenTableProps = {
  rawPairs: IdeaTokenMarketPair[]
  isPairsDataLoading: boolean
  refetch: () => void
  canFetchMore: boolean
  orderDirection: string
  orderBy: string
  fetchMore: () => any
  headerClicked: (value: string) => void
  userData: any
}

export default function OwnedTokenTableNew({
  rawPairs,
  isPairsDataLoading,
  refetch,
  canFetchMore,
  orderDirection,
  orderBy,
  fetchMore,
  headerClicked,
  userData,
}: OwnedTokenTableProps) {
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

  const getColumnContent = (column) => {
    switch (column.value) {
      case 'lockButton':
        return (
          <div className="flex items-center space-x-1">
            <span>Lock</span>
            <Tooltip>
              <div className="w-32 md:w-64">
                Lock tokens to show your long-term confidence in a listing. You
                will be unable to sell or withdraw locked tokens for the time
                period specified.
                <br />
                <br />
                For more information, see{' '}
                <A
                  href="https://docs.ideamarket.io/user-guide/tutorial#buy-upvotes"
                  target="_blank"
                  className="underline"
                >
                  locking tokens
                </A>
                .
              </div>
            </Tooltip>
            {/* TODO: make this APR value dynamic */}
            {/* <span className="text-blue-600">Up to 112% APR</span> */}
          </div>
        )
      default:
        return column.title
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
                          {orderBy === header.value &&
                            orderDirection === 'asc' && (
                              <span className="text-xs">&#x25B2;</span>
                            )}
                          {orderBy === header.value &&
                            orderDirection === 'desc' && (
                              <span className="text-xs">&#x25bc;</span>
                            )}
                          &nbsp;
                        </>
                      )}
                      {getColumnContent(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-500">
                {rawPairs.map((pair: any, index) => (
                  <OwnedTokenRowNew
                    key={index}
                    token={pair.token}
                    market={pair.market}
                    balance={pair.balance}
                    balanceBN={pair.rawBalance}
                    lockedAmount={pair?.lockedAmount}
                    isL1={pair.token.isL1}
                    refetch={refetch}
                    userData={userData}
                    lastElementRef={
                      rawPairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
                {isPairsDataLoading
                  ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <OwnedTokenRowSkeleton key={token} />
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
