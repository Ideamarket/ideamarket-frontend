import classNames from 'classnames'
import { useState } from 'react'
import { useQuery } from 'react-query'
import ReactTimeAgo from 'react-time-ago'
import { Transition } from '@headlessui/react'
import { TokenAmount } from 'pages/api/[market]/[token]'
import A from './A'

function DetailsView({
  isOpen,
  setIsOpen,
  token,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  token: TokenAmount
}) {
  const tokenName = token.name[0] === '@' ? token.name.slice(1) : token.name

  if (!isOpen) {
    return <></>
  }
  return (
    <>
      <section
        className="fixed inset-0 z-20 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition
            className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            show={isOpen}
            aria-hidden="true"
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <Transition
              show={isOpen}
              className="relative w-96"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Transition
                show={isOpen}
                className="absolute top-0 left-0 flex pt-4 pr-2 -ml-8 sm:-ml-10 sm:pr-4"
                enter="ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <button
                  className="text-gray-300 rounded-md hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Transition>
              {isOpen && (
                <div className="h-full p-8 overflow-y-auto bg-white">
                  <div className="pb-16 space-y-6">
                    <div>
                      <div className="block w-full overflow-hidden rounded-lg aspect-w-10 aspect-h-7">
                        <img
                          src={`https://unavatar.backend.ideamarket.io/${token.market}/${tokenName}`}
                          alt=""
                          className="object-contain"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h2 className="text-lg font-medium text-gray-900">
                          <span className="sr-only">Details for </span>
                          {token.name}
                        </h2>
                        <p className="text-sm font-medium text-gray-500">
                          Rank {token.rank}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Information</h3>
                      <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Price</dt>
                          <dd className="text-gray-900">${token.price}</dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Deposits</dt>
                          <dd className="text-gray-900">
                            ${(token.marketCap / 1e18).toFixed(2)}
                          </dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Percentage locked</dt>
                          <dd className="text-gray-900">
                            {token.lockedPercentage}%
                          </dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">24H change</dt>
                          <dd className="text-gray-900">
                            {(token.dayChange * 100).toFixed(2)}%
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="flex">
                      <A
                        href={`/i/${token.market.toLocaleLowerCase()}/${tokenName}`}
                        className="flex-1 px-4 py-2 text-sm font-medium text-center text-white border border-transparent rounded-md shadow-sm bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Listing
                      </A>
                    </div>
                  </div>
                </div>
              )}
            </Transition>
          </div>
        </div>
      </section>
    </>
  )
}

function Token({ token, sortBy }: { token: TokenAmount; sortBy: SortBy }) {
  const [isOpen, setIsOpen] = useState(false)
  const tokenName = token.name[0] === '@' ? token.name.slice(1) : token.name
  const twitterLogo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      className="inline-block align-middle"
    >
      <path
        d="M17.857 20C19.04 20 20 19.04 20 17.857V2.143C20 .96 19.04 0 17.857 0H2.143C.96 0 0 .96 0 2.143v15.714C0 19.04.96 20 2.143 20h15.714zM7.353 15.8a8.297 8.297 0 01-4.496-1.313c.237.026.464.035.705.035 1.371 0 2.63-.464 3.634-1.25a2.93 2.93 0 01-2.736-2.03c.45.066.857.066 1.321-.055a2.927 2.927 0 01-2.343-2.874v-.036a2.92 2.92 0 001.32.37C4.04 8.17 3.456 7.08 3.456 6.215V6.21c0-.545.143-1.045.398-1.478a8.305 8.305 0 006.034 3.063c-.415-1.987 1.072-3.599 2.858-3.599.843 0 1.602.353 2.138.925a5.736 5.736 0 001.857-.706 2.923 2.923 0 01-1.286 1.612 5.832 5.832 0 001.688-.456 6.142 6.142 0 01-1.469 1.518c.009.125.009.255.009.38 0 3.87-2.946 8.33-8.33 8.33z"
        fillRule="nonzero"
        className=""
      ></path>
    </svg>
  )
  const substackLogo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      className="inline-block align-middle"
    >
      <path
        d="M17.857 20C19.04 20 20 19.04 20 17.857V2.143C20 .96 19.04 0 17.857 0H2.143C.96 0 0 .96 0 2.143v15.714C0 19.04.96 20 2.143 20h15.714zM7.353 15.8a8.297 8.297 0 01-4.496-1.313c.237.026.464.035.705.035 1.371 0 2.63-.464 3.634-1.25a2.93 2.93 0 01-2.736-2.03c.45.066.857.066 1.321-.055a2.927 2.927 0 01-2.343-2.874v-.036a2.92 2.92 0 001.32.37C4.04 8.17 3.456 7.08 3.456 6.215V6.21c0-.545.143-1.045.398-1.478a8.305 8.305 0 006.034 3.063c-.415-1.987 1.072-3.599 2.858-3.599.843 0 1.602.353 2.138.925a5.736 5.736 0 001.857-.706 2.923 2.923 0 01-1.286 1.612 5.832 5.832 0 001.688-.456 6.142 6.142 0 01-1.469 1.518c.009.125.009.255.009.38 0 3.87-2.946 8.33-8.33 8.33z"
        fill="#fff"
      ></path>
      <path fill="#fff" d="M2.352 1.949h15.297v15.106H2.352z"></path>
      <path d="M15.278 6.697H4.721v1.421h10.557zM4.721 9.405v6.605L10 13.06l5.279 2.95V9.405zM15.278 3.99H4.721v1.42h10.557z"></path>
    </svg>
  )
  return (
    <>
      <DetailsView isOpen={isOpen} setIsOpen={setIsOpen} token={token} />
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <h2 className="sr-only" id="profile-overview-title">
          Profile Overview
        </h2>
        <div className="p-6 bg-white">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="flex-shrink-0">
                <img
                  className="w-20 h-20 mx-auto rounded-full"
                  src={`https://unavatar.backend.ideamarket.io/${token.market}/${tokenName}`}
                  alt={token.name}
                />
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                <p className="text-sm font-medium text-gray-600">
                  Rank {token.rank}
                </p>
                <p className="text-xl font-bold text-gray-900 sm:text-xl">
                  {token.name}{' '}
                  <span>
                    {token.market === 'Twitter' ? twitterLogo : substackLogo}
                  </span>
                </p>
                <p className="text-sm font-medium text-gray-600">
                  ${token.price}
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-5 sm:mt-0">
              <button
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                onClick={() => setIsOpen(true)}
              >
                View details
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 border-t border-gray-200 divide-y divide-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center',
              sortBy === 'holders' && 'bg-indigo-100'
            )}
          >
            <span className="text-gray-900">{token.stats.holders}</span>{' '}
            <span className="text-gray-600">mutual holders</span>
          </div>
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center',
              sortBy === 'amount' && 'bg-indigo-100'
            )}
          >
            <span className="text-gray-900">{token.stats.amount}</span>{' '}
            <span className="text-gray-600">tokens bought</span>
          </div>
          <div
            className={classNames(
              'px-6 py-5 text-sm font-medium text-center',
              sortBy === 'timestamp' && 'bg-indigo-100'
            )}
          >
            <span className="text-gray-600">Bought </span>
            <span className="text-gray-900">
              <ReactTimeAgo
                date={new Date(token.stats.timestamp * 1000)}
                locale="en-US"
              />
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

type SortBy = 'holders' | 'amount' | 'timestamp'

export default function RelatedTokens({
  token,
  market,
}: {
  token: string
  market: string
}) {
  const [sortBy, setSortBy] = useState<SortBy>('holders')
  const { isLoading, isError, data } = useQuery<TokenAmount[]>(
    `/api/${market}/${token}`,
    () =>
      fetch(`/api/${market}/${token}`).then((res) => {
        if (!res.ok) {
          throw new Error('Something went wrong!!')
        }
        return res.json()
      })
  )

  function sortedTokens() {
    if (isLoading || isError || !data) {
      return []
    }
    return data.sort(
      (a, b) => Number(b.stats[sortBy]) - Number(a.stats[sortBy])
    )
  }

  if (isLoading) {
    return <p>loading...</p>
  }
  if (isError) {
    return <p>Something went wrong!!!</p>
  }

  return (
    <>
      <div className="">
        <div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {sortedTokens().length > 0 && sortBy === 'holders' && (
                <>
                  Most holders of{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    {token}
                  </span>{' '}
                  also bought
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-purple-100 text-purple-800">
                    {sortedTokens()[0].name}
                  </span>{' '}
                  tokens.
                </>
              )}

              {sortedTokens().length > 0 && sortBy === 'amount' && (
                <>
                  Holders of
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    {token}
                  </span>{' '}
                  bought most amount of
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-purple-100 text-purple-800">
                    {sortedTokens()[0].name}
                  </span>{' '}
                  tokens.
                </>
              )}

              {sortedTokens().length > 0 && sortBy === 'timestamp' && (
                <>
                  Holders of
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    {token}
                  </span>{' '}
                  most recently bought
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-purple-100 text-purple-800">
                    {sortedTokens()[0].name}
                  </span>{' '}
                  tokens.
                </>
              )}
            </h3>

            <div className="inline-block">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Sort By
              </label>
              <select
                id="location"
                name="location"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setSortBy(e.target.value as any)}
                value={sortBy}
              >
                <option value="holders">Number of users who bought</option>
                <option value="amount">Amount of tokens bought</option>
                <option value="timestamp">Recently bought first</option>
              </select>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-5 mt-5 lg:grid-cols-2">
            {sortedTokens().map((token, index) => (
              <Token token={token} key={token.name} sortBy={sortBy} />
            ))}
          </dl>
        </div>
      </div>
    </>
  )
}
