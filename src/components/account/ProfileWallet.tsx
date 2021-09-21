import { flatten } from 'lodash'
import classNames from 'classnames'
import BN from 'bn.js'
import { useState, useEffect } from 'react'
import { useInfiniteQuery } from 'react-query'
import {
  MarketSelect,
  OwnedTokenTable,
  MyTokenTable,
  LockedTokenTable,
  DefaultLayout,
  WalletModal,
} from '../../components'
import { useWalletStore } from '../../store/walletStore'
import {
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  calculateIdeaTokenDaiValue,
  bigNumberTenPow18,
} from 'utils'
import {
  queryOwnedTokensMaybeMarket,
  queryLockedTokens,
  queryMyTrades,
  queryMyTokensMaybeMarket,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import MyTradesTable from 'components/tokens/MyTradesTable/MyTradesTable'

const TOKENS_PER_PAGE = 10

const infiniteQueryConfig = {
  getFetchMore: (lastGroup, allGroups) => {
    const morePagesExist = lastGroup?.length === TOKENS_PER_PAGE

    if (!morePagesExist) {
      return false
    }

    return allGroups.length * TOKENS_PER_PAGE
  },
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  enabled: false,
}

export default function ProfileWallet() {
  const web3 = useWalletStore((state) => state.web3)

  const [selectedMarket, setSelectedMarket] = useState(undefined)
  const [ownedTokenTotalValue, setOwnedTokensTotalValue] = useState('0.00')
  const [lockedTokenTotalValue, setLockedTokensTotalValue] = useState('0.00')
  const [purchaseTotalValue, setPurchaseTotalValue] = useState('0.00')

  const address = useWalletStore((state) => state.address)

  const {
    data: infiniteOwnedData,
    isFetching: isOwnedPairsDataLoading,
    fetchMore: fetchMoreOwned,
    refetch: refetchOwned,
    canFetchMore: canFetchMoreOwned,
  } = useInfiniteQuery(
    ['owned-tokens', TOKENS_PER_PAGE],
    ownedQueryFunction,
    infiniteQueryConfig
  )

  const ownedPairs = flatten(infiniteOwnedData || [])

  const {
    data: infiniteListingsData,
    isFetching: isListingsPairsDataLoading,
    fetchMore: fetchMoreListings,
    refetch: refetchListings,
    canFetchMore: canFetchMoreListings,
  } = useInfiniteQuery(
    ['my-tokens', TOKENS_PER_PAGE],
    listingsQueryFunction,
    infiniteQueryConfig
  )

  const listingPairs = flatten(infiniteListingsData || [])

  const {
    data: infiniteLockedData,
    isFetching: isLockedPairsDataLoading,
    fetchMore: fetchMoreLocked,
    refetch: refetchLocked,
    canFetchMore: canFetchMoreLocked,
  } = useInfiniteQuery(
    ['locked-tokens', TOKENS_PER_PAGE],
    lockedQueryFunction,
    infiniteQueryConfig
  )

  const lockedPairs = flatten(infiniteLockedData || [])

  const {
    data: infiniteTradesData,
    isFetching: isTradesPairsDataLoading,
    fetchMore: fetchMoreTrades,
    refetch: refetchMyTrades,
    canFetchMore: canFetchMoreTrades,
  } = useInfiniteQuery(
    ['my-trades', TOKENS_PER_PAGE],
    tradesQueryFunction,
    infiniteQueryConfig
  )

  const myTrades = flatten(infiniteTradesData || [])

  const [table, setTable] = useState('holdings')

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canFetchMoreOwned,
    canFetchMoreLocked,
    canFetchMoreTrades,
    selectedMarket,
    web3,
  ])

  function refetch() {
    refetchOwned()
    refetchLocked()
    refetchMyTrades()
    refetchListings()
  }

  async function ownedQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const result = await queryOwnedTokensMaybeMarket(
      key,
      selectedMarket,
      address
    )
    // Calculate the total value of non-locked tokens
    let ownedTotal = new BN('0')
    for (const pair of result ?? []) {
      ownedTotal = ownedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }
    setOwnedTokensTotalValue(
      result ? web3BNToFloatString(ownedTotal, bigNumberTenPow18, 18) : '0.00'
    )

    const lastIndex =
      numTokens + skip > result?.length ? result?.length : numTokens + skip

    return result?.slice(skip, lastIndex) || []
  }

  async function listingsQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const result = await queryMyTokensMaybeMarket(key, selectedMarket, address)

    const lastIndex =
      numTokens + skip > result?.length ? result?.length : numTokens + skip

    return result?.slice(skip, lastIndex) || []
  }

  async function lockedQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const result = await queryLockedTokens(key, selectedMarket, address)
    // Calculate the total value of locked tokens
    let lockedTotal = new BN('0')
    for (const pair of result ?? []) {
      lockedTotal = lockedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }
    setLockedTokensTotalValue(
      result ? web3BNToFloatString(lockedTotal, bigNumberTenPow18, 18) : '0.00'
    )

    const lastIndex =
      numTokens + skip > result?.length ? result?.length : numTokens + skip

    return result?.slice(skip, lastIndex) || []
  }

  async function tradesQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const result = await queryMyTrades(key, selectedMarket, address)
    // Calculate the total purchase value
    let purchaseTotal = new BN('0')
    for (const pair of result ?? []) {
      if (pair.isBuy) purchaseTotal = purchaseTotal.add(pair.rawDaiAmount)
    }

    setPurchaseTotalValue(
      result
        ? web3BNToFloatString(purchaseTotal, bigNumberTenPow18, 18)
        : '0.00'
    )

    const lastIndex =
      numTokens + skip > result?.length ? result?.length : numTokens + skip

    return result?.slice(skip, lastIndex) || []
  }

  return (
    <div className="w-full h-full mt-8 md:w-3/4 md:mt-0">
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="hidden p-3 text-3xl font-semibold border-gray-100 sm:block sm:border-b dark:border-gray-400">
          Profile
        </div>
        <div className="flex justify-between">
          <div className="pr-6 text-center">
            <div className="text-sm font-semibold text-opacity-60">
              Total Purchase Value
            </div>
            <div
              className="text-2xl mb-2.5 font-semibold uppercase"
              title={'$' + +purchaseTotalValue}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                (+purchaseTotalValue).toFixed(2)
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-opacity-60">
              Total Current Value
            </div>
            <div
              className="text-2xl mb-2.5 font-semibold uppercase"
              title={'$' + +ownedTokenTotalValue + +lockedTokenTotalValue}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                (+ownedTokenTotalValue + +lockedTokenTotalValue).toFixed(2)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray ">
        <div className="flex flex-col mx-5 dark:border-gray-500 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="xs:inline-block">
              <div
                className={classNames(
                  'text-base text-brand-new-dark dark:text-gray-300 font-semibold lg:px-2 mr-5 py-3 pt-2 inline-block cursor-pointer',
                  table === 'holdings'
                    ? 'border-b-2 border-brand-new-dark dark:border-gray-300'
                    : ''
                )}
                onClick={() => {
                  setTable('holdings')
                }}
              >
                Holdings
              </div>
              <div
                className={classNames(
                  'text-base text-brand-new-dark dark:text-gray-300 font-semibold lg:px-2 mr-5 py-3 pt-2 inline-block cursor-pointer',
                  table === 'listings'
                    ? 'border-b-2 border-brand-new-dark dark:border-gray-300'
                    : ''
                )}
                onClick={() => {
                  setTable('listings')
                }}
              >
                Listings
              </div>
            </div>
            <div className="xs:inline-block">
              <div
                className={classNames(
                  'text-base text-brand-new-dark dark:text-gray-300 font-semibold lg:px-2 mr-5 py-3 pt-2 inline-block cursor-pointer',
                  table === 'locked'
                    ? 'border-b-2 border-brand-new-dark dark:border-gray-300'
                    : ''
                )}
                onClick={() => {
                  setTable('locked')
                }}
              >
                Locked
              </div>
              <div
                className={classNames(
                  'text-base text-brand-new-dark dark:text-gray-300 font-semibold lg:px-2 py-3 pt-2 inline-block cursor-pointer',
                  table === 'trades'
                    ? 'border-b-2 border-brand-new-dark dark:border-gray-300'
                    : ''
                )}
                onClick={() => {
                  setTable('trades')
                }}
              >
                Trades
              </div>
            </div>
          </div>
          <div
            className="w-full pt-6 pr-0 mb-4 md:w-80 md:pt-0 md:mb-0"
            style={{ marginTop: -8 }}
          >
            <MarketSelect
              isClearable={true}
              onChange={(value) => {
                setSelectedMarket(value?.market)
              }}
              disabled={false}
            />
          </div>
        </div>
        <div className="border-t border-brand-border-gray dark:border-gray-500 shadow-home ">
          {!web3 && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  ModalService.open(WalletModal)
                }}
                className="my-40 p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
              >
                Connect Wallet to View
              </button>
            </div>
          )}
          {table === 'holdings' && web3 !== undefined && (
            <OwnedTokenTable
              rawPairs={ownedPairs}
              isPairsDataLoading={isOwnedPairsDataLoading}
              refetch={refetch}
              canFetchMore={canFetchMoreOwned}
              fetchMore={fetchMoreOwned}
            />
          )}
          {table === 'listings' && web3 !== undefined && (
            <MyTokenTable
              rawPairs={listingPairs}
              isPairsDataLoading={isListingsPairsDataLoading}
              canFetchMore={canFetchMoreListings}
              fetchMore={fetchMoreListings}
            />
          )}

          {table === 'locked' && web3 !== undefined && (
            <LockedTokenTable
              rawPairs={lockedPairs}
              isPairsDataLoading={isLockedPairsDataLoading}
              canFetchMore={canFetchMoreLocked}
              fetchMore={fetchMoreLocked}
            />
          )}
          {table === 'trades' && web3 !== undefined && (
            <MyTradesTable
              rawPairs={myTrades}
              isPairsDataLoading={isTradesPairsDataLoading}
              canFetchMore={canFetchMoreTrades}
              fetchMore={fetchMoreTrades}
            />
          )}
        </div>
      </div>
    </div>
  )
}

ProfileWallet.layoutProps = {
  Layout: DefaultLayout,
}
