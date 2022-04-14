import classNames from 'classnames'
import { Tooltip } from 'components'
import A from 'components/A'
import ColSize from 'components/tables/ColSize'
import { useCallback, useRef, MutableRefObject } from 'react'
import { IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import OwnedTokenRowNew from './OwnedTokenRowNew'
import OwnedTokenRowSkeleton from './OwnedTokenRowSkeleton'
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid'
import { TABLE_NAMES } from 'utils/tables'

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

  const getColumnStyle = (column) => {
    switch (column.value) {
      case 'name':
      case 'price':
        return 'pl-6'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="overflow-hidden dark:border-gray-500">
            <table className="table-fixed w-full divide-y divide-gray-200 dark:divide-gray-500">
              <ColSize
                columnData={headers}
                tableName={TABLE_NAMES.ACCOUNT_HOLDINGS}
              />

              <thead className="hidden h-24 md:table-header-group">
                <tr>
                  {headers.map((header) => (
                    <th
                      className={classNames(
                        getColumnStyle(header),
                        'pr-5 py-5 text-xs leading-4 text-left text-brand-gray-4 dark:text-gray-200 bg-gray-50 dark:bg-gray-600',
                        header.sortable && 'cursor-pointer'
                      )}
                      key={header.value}
                      onClick={() => {
                        if (header.sortable) {
                          headerClicked(header.value)
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <span className="uppercase mr-1">
                          {getColumnContent(header)}
                        </span>
                        {rawPairs &&
                          rawPairs?.length > 0 &&
                          header.sortable &&
                          orderBy === header.value && (
                            <div
                              className="h-8 z-[42] text-[.65rem] flex justify-center items-center"
                              title="SORT"
                            >
                              {orderDirection === 'desc' ? (
                                <SortDescendingIcon className="w-3.5 text-blue-500" />
                              ) : (
                                <SortAscendingIcon className="w-3.5 text-blue-500" />
                              )}
                            </div>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-500">
                {rawPairs.map((pair: any, index) => (
                  <OwnedTokenRowNew
                    key={index}
                    ideaToken={pair.token}
                    market={pair.market}
                    balance={pair.balance}
                    balanceBN={pair.rawBalance}
                    lockedAmount={pair?.lockedAmount}
                    isL1={pair.token.isL1}
                    refetch={refetch}
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
