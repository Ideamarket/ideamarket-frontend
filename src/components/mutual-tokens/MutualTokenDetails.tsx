import { Transition } from '@headlessui/react'
import { useTokenIconURL } from 'actions'
import A from 'components/A'
import WatchingStar from 'components/WatchingStar'
import { IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
} from 'utils'

export default function MutualTokenDetails({
  isOpen,
  setIsOpen,
  token,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  token: IdeaToken
}) {
  const marketSpecifics = getMarketSpecificsByMarketName(token.marketName)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
  return (
    <>
      <Transition
        show={isOpen}
        className="fixed inset-0 z-20 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75"
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
            <Transition.Child
              className="relative w-96"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Transition.Child
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
              </Transition.Child>
              {isOpen && (
                <div className="h-full p-8 overflow-y-auto bg-white dark:bg-gray-700">
                  <div className="pb-16 space-y-6">
                    <div>
                      <div className="block w-full overflow-hidden rounded-lg aspect-w-10 aspect-h-7">
                        {isTokenIconLoading ? (
                          <div className="w-full h-full bg-gray-400 rounded-lg animate-pulse"></div>
                        ) : (
                          <img
                            src={tokenIconURL}
                            alt=""
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="flex items-start justify-between mt-4">
                        <div>
                          <A
                            href={`/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
                              token.name
                            )}`}
                          >
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:underline">
                              <span className="sr-only">Details for </span>
                              {token.name}
                            </h2>
                          </A>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            Rank {token.rank}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="flex items-center justify-center w-8 h-8 ml-4 text-gray-400 bg-white dark:bg-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <WatchingStar token={token} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Information
                      </h3>
                      <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-300">
                            Price
                          </dt>
                          <dd className="text-gray-900 dark:text-gray-100">
                            ${formatNumber(token.latestPricePoint.price)}
                          </dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-300 ">
                            Deposits
                          </dt>
                          <dd className="text-gray-900 dark:text-gray-100">
                            $
                            {formatNumberWithCommasAsThousandsSerperator(
                              token.marketCap
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500 dark:text-gray-300">
                            Percentage locked
                          </dt>
                          <dd className="text-gray-900 dark:text-gray-100">
                            {token.lockedPercentage}%
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="flex">
                      <A
                        href={`/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
                          token.name
                        )}`}
                        className="flex-1 px-4 py-2 text-sm font-medium text-center text-white border border-transparent rounded-md shadow-sm bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Listing
                      </A>
                    </div>
                  </div>
                </div>
              )}
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </>
  )
}
