import classNames from 'classnames'
import { useQuery } from 'react-query'
import {
  IdeaTokenMarketPair,
  queryOwnedTokensMaybeMarket,
} from 'store/ideaMarketsStore'
import { useMarketStore } from 'store/markets'
import { formatNumber } from 'utils'
import L1TokenTableRow from './L1TokenTableRow'

type Header = {
  title: string
  value: string
}

const headers: Header[] = [
  {
    title: '',
    value: 'market',
  },
  {
    title: 'Name',
    value: 'name',
  },
  {
    title: 'Balance',
    value: 'balance',
  },
]

export default function L1TokenTable({
  l2Recipient,
  setSelectedPair,
}: {
  l2Recipient: string
  setSelectedPair: (pair: IdeaTokenMarketPair) => void
}) {
  const allMarkets = useMarketStore((state) => state.markets)
  const filteredMarkets = allMarkets.map((m) => m?.market)

  const { data: rawPairs, isLoading } = useQuery(
    ['l1-tokens', l2Recipient, allMarkets],
    () =>
      queryOwnedTokensMaybeMarket(
        l2Recipient,
        filteredMarkets,
        100,
        0,
        'price',
        'desc',
        [],
        '',
        false
      )
  )

  const l1Holdings = rawPairs?.holdings?.filter((pair) => pair.token.isL1)

  if (!rawPairs) {
    return <></>
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="hidden md:table-header-group">
                  <tr>
                    {headers.map((header) => (
                      <th
                        className={classNames(
                          'px-5 py-4 text-sm font-semibold leading-4 tracking-wider text-left text-brand-gray-4 bg-gray-50'
                        )}
                        style={{ backgroundColor: '#f9fbfd' }}
                        key={header.value}
                      >
                        {header.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    'loading'
                  ) : (
                    <>
                      {l1Holdings?.map((pair) => (
                        <L1TokenTableRow
                          key={pair.address}
                          pair={pair}
                          balance={formatNumber(pair.balance)}
                          setSelectedPair={setSelectedPair}
                        />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
