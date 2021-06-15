import classNames from 'classnames'
import { useState } from 'react'
import { IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
} from 'utils'
import ReactTimeAgo from 'react-time-ago'
import { MutualTokenDetails, MutualTokensListSortBy, A } from 'components'
import { useTokenIconURL } from 'actions'

export default function MutualToken({
  stats,
  token,
  sortBy,
}: {
  stats: { latestTimestamp: number; totalAmount: number; totalHolders: number }
  token: IdeaToken
  sortBy: MutualTokensListSortBy
}) {
  const marketSpecifics = getMarketSpecificsByMarketName(token.marketName)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <MutualTokenDetails isOpen={isOpen} setIsOpen={setIsOpen} token={token} />
      <div className="overflow-hidden bg-white dark:bg-gray-700 rounded-lg shadow ">
        <h2 className="sr-only" id="profile-overview-title">
          Profile Overview
        </h2>
        <div className="p-6 bg-white dark:bg-gray-700">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex lg:space-x-5">
              <div className="flex-shrink-0">
                {isTokenIconLoading ? (
                  <div className="w-20 h-20 mx-auto bg-gray-400 rounded-full animate-pulse"></div>
                ) : (
                  <img
                    className="w-20 h-20 mx-auto rounded-full"
                    src={tokenIconURL}
                    alt={token.name}
                  />
                )}
              </div>
              <div className="mt-4 text-center lg:mt-0 lg:pt-1 lg:text-left">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rank {token.rank}
                </p>
                <A
                  href={`/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
                    token.name
                  )}`}
                >
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-200 lg:text-xl hover:underline">
                    {token.name}{' '}
                    <span>{marketSpecifics.getMarketSVGTheme()}</span>
                  </p>
                </A>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  ${formatNumber(token.latestPricePoint.price)}
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-5 lg:mt-0">
              <button
                className="flex items-center justify-center dark:bg-gray-500 dark:border-gray-500 dark:text-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => setIsOpen(true)}
              >
                View details
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-200 divide-y divide-gray-200 bg-gray-50 dark:bg-gray-600 lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center lg:flex lg:flex-col',
              sortBy === 'totalHolders' &&
                'bg-brand-light-blue dark:bg-gray-500'
            )}
          >
            <span className="text-gray-900 dark:text-gray-200">
              {stats.totalHolders}
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              mutual holders
            </span>
          </div>
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center lg:flex lg:flex-col',
              sortBy === 'totalAmount' && 'bg-brand-light-blue dark:bg-gray-500'
            )}
          >
            <span className="text-gray-900 dark:text-gray-200">
              {formatNumberWithCommasAsThousandsSerperator(stats.totalAmount)}
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              tokens held
            </span>
          </div>
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center lg:flex lg:flex-col',
              sortBy === 'latestTimestamp' &&
                'bg-brand-light-blue dark:bg-gray-500'
            )}
          >
            <span className="text-gray-900 dark:text-gray-200">
              <ReactTimeAgo
                date={new Date(stats.latestTimestamp * 1000)}
                locale="en-US"
              />
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              Last bought{' '}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
