import classNames from 'classnames'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { IdeaToken, queryLockedAmounts } from 'store/ideaMarketsStore'
import LockedTokenRowSkeleton from './LockedTokenRowSkeleton'
import Lock from '../../assets/lock.svg'
import ChevronLeft from '../../assets/chevron-left.svg'
import ChevronRight from '../../assets/chevron-right.svg'
import { DateTime } from 'luxon'

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
      <div className="bg-white divide-y divide-gray-200">
        {isLockedTokensLoading ? (
          Array.from(Array(TOKENS_PER_PAGE).keys()).map((token) => (
            <LockedTokenRowSkeleton key={token} />
          ))
        ) : (
          <>
            {lockedTokens.map((lockedAmount, i) => (
              <div
                key={lockedAmount.lockedUntil}
                className="flex flex-col justify-between p-5 text-base font-semibold rounded-md md:flex-row text-brand-new-dark"
                style={{ backgroundColor: '#f9fbfd' }}
              >
                <div>
                  <span
                    className="mr-3"
                    style={{ position: 'relative', top: -3 }}
                  >
                    <Lock />
                  </span>
                  {DateTime.fromSeconds(
                    Number(lockedAmount.lockedUntil)
                  ).toLocaleString(DateTime.DATETIME_MED)}
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
              <ChevronLeft style={{ width: 20 }} />
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
              <ChevronRight style={{ width: 20 }} />
            </button>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-1 py-1 ml-5 mr-2 text-sm font-medium bg-white border-2 rounded-lg cursor-default tracking-tightest-2 font-sf-compact-medium text-brand-gray-2">
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
