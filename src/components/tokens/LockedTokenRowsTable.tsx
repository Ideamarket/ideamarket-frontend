import classNames from 'classnames'
import { useState } from 'react'
import moment from 'moment'
import { useQuery } from 'react-query'
import { IdeaToken, queryLockedAmounts } from 'store/ideaMarketsStore'
import LockedTokenRowSkeleton from './LockedTokenRowSkeleton'
import { LockClosedIcon } from '@heroicons/react/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'

export default function LockedTokenTable({
  token,
  owner,
}: {
  token: IdeaToken
  owner: string
}) {
  const TOKENS_PER_PAGE = 3

  const [page, setPage] = useState(0)

  const { data: lockedTokens, isLoading: isLockedTokensLoading } = useQuery(
    [
      'locked-tokens',
      token.address,
      owner,
      page * TOKENS_PER_PAGE,
      TOKENS_PER_PAGE,
      'lockedUntil',
      'asc',
    ],
    queryLockedAmounts
  )

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
        {isLockedTokensLoading ? (
          Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
            <LockedTokenRowSkeleton key={token} page="listing" />
          ))
        ) : (
          <>
            {lockedTokens.map((lockedAmount, i) => (
              <div
                key={lockedAmount.lockedUntil}
                className="flex flex-col justify-between p-5 dark:bg-gray-700 text-base font-semibold rounded-md md:flex-row text-brand-new-dark dark:text-gray-300"
              >
                <div>
                  <LockClosedIcon className="text-blue-500" />
                  {moment(lockedAmount.lockedUntil * 1000).format('LLL')}
                </div>
                <div className="mt-2 md:mt-0">
                  <div>{lockedAmount.amount}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {isLockedTokensLoading ? (
        <></>
      ) : page > 0 || lockedTokens.length > 0 ? (
        <>
          <div
            className="absolute flex flex-row"
            style={{ top: -38, right: 0 }}
          >
            <button
              onClick={() => {
                if (page > 0) setPage(page - 1)
              }}
              className={classNames(
                'cursor-pointer',
                page <= 0 ? 'cursor-not-allowed opacity-50' : ''
              )}
              disabled={page <= 0}
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => {
                if (lockedTokens && lockedTokens.length === TOKENS_PER_PAGE)
                  setPage(page + 1)
              }}
              className={classNames(
                'cursor-pointer',
                lockedTokens?.length !== TOKENS_PER_PAGE
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              )}
              disabled={lockedTokens?.length !== TOKENS_PER_PAGE}
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-1 py-1 ml-5 mr-2 text-sm font-medium bg-white dark:bg-gray-700 dark:border-gray-500 border-2 rounded-lg cursor-default tracking-tightest-2 font-sf-compact-medium text-brand-gray-2">
              Withdraw unlocked
            </button>
          </div>
        </>
      ) : page === 0 ? (
        <div className="text-lg font-semibold text-center text-brand-gray-2">
          No Locked Tokens
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
