import classNames from 'classnames'
import { useCallback, useRef, MutableRefObject } from 'react'
import { useQuery } from 'react-query'
import { IdeaTokenMarketPair } from 'store/ideaMarketsStore'
import { querySupplyRate } from 'store/compoundStore'
import MyTokenRowNew from './MyTokenRowNew'
import MyTokenRowSkeleton from './MyTokenRowSkeleton'

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

type MyTokenTableProps = {
  rawPairs: IdeaTokenMarketPair[]
  isPairsDataLoading: boolean
  canFetchMore: boolean
  orderDirection: string
  orderBy: string
  fetchMore: () => any
  headerClicked: (value: string) => void
  userData: any
}

export default function MyTokenTableNew({
  rawPairs,
  isPairsDataLoading,
  canFetchMore,
  orderDirection,
  orderBy,
  fetchMore,
  headerClicked,
  userData,
}: MyTokenTableProps) {
  const TOKENS_PER_PAGE = 10

  const { data: compoundSupplyRate, isLoading: isCompoundSupplyRateLoading } =
    useQuery('compound-supply-rate', querySupplyRate)

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

  const isLoading = isPairsDataLoading || isCompoundSupplyRateLoading

  return (
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
                      {header.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-500">
                {rawPairs.map((pair, index) => (
                  <MyTokenRowNew
                    key={pair.token.tokenID}
                    token={pair.token}
                    market={pair.market}
                    compoundSupplyRate={compoundSupplyRate}
                    userData={userData}
                    lastElementRef={
                      rawPairs.length === index + 1 ? lastElementRef : null
                    }
                  />
                ))}
                {isLoading
                  ? Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
                      <MyTokenRowSkeleton key={token} />
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
