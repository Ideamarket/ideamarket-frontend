import { flatten } from 'lodash'
import classNames from 'classnames'
import BN from 'bn.js'
import { useState, useEffect } from 'react'
import { useInfiniteQuery } from 'react-query'
import {
  MarketSelect,
  OwnedTokenTableNew,
  MyTokenTableNew,
  LockedTokenTableNew,
  WalletModal,
  MyTradesTableNew,
} from '../../components'
import { useWalletStore } from '../../store/walletStore'
import {
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  calculateIdeaTokenDaiValue,
  bigNumberTenPow18,
  calculateCurrentPriceBN,
} from 'utils'
import {
  queryOwnedTokensMaybeMarket,
  queryLockedTokens,
  queryMyTrades,
  queryMyTokensMaybeMarket,
  IdeaTokenTrade,
  IdeaTokenMarketPair,
  LockedIdeaTokenMarketPair,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import { sortNumberByOrder, sortStringByOrder } from 'components/tokens/utils'

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

type Props = {
  walletState: string // This stores whether wallet is on public page, signed-in account page, or non-signed-in account page
  userData?: any
}

export default function ProfileWallet({ walletState, userData }: Props) {
  const web3 = useWalletStore((state) => state)
  const address = useWalletStore((state) => state.address)
  const verifiedAddresses = userData?.ethAddresses?.filter(
    (item) => item?.verified
  )

  const [selectedMarket, setSelectedMarket] = useState(undefined)
  const [ownedTokenTotalValue, setOwnedTokensTotalValue] = useState('0.00')
  const [lockedTokenTotalValue, setLockedTokensTotalValue] = useState('0.00')
  const [purchaseTotalValue, setPurchaseTotalValue] = useState('0.00')

  /*
   * @return list of tokens from all ETH addresses
   */
  const queryIterator = async (key, queryFunction) => {
    // Addresses that will be displayed in the tables
    const finalAddresses = getFinalAddresses()
    let result = []
    for (let i = 0; i < finalAddresses?.length; i++) {
      const queryResult = await queryFunction(
        key,
        selectedMarket,
        finalAddresses[i]?.address
      )
      result = result.concat(queryResult)
    }

    return result
  }

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
  const [orderBy, setOrderBy] = useState('price')
  const [orderDirection, setOrderDirection] = useState('desc')

  useEffect(() => {
    if (userData?.ethAddresses.length > 0) {
      refetch()
    }
    // Need userData?.ethAddresses in order to dynamically update tokens on switch to a newly added wallet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, web3, orderBy, orderDirection, userData?.ethAddresses])

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
    const result = await queryIterator(key, queryOwnedTokensMaybeMarket)
    sortOwned(result)

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
    const result = await queryIterator(key, queryMyTokensMaybeMarket)
    sortListings(result)

    const lastIndex =
      numTokens + skip > result?.length ? result?.length : numTokens + skip

    return result?.slice(skip, lastIndex) || []
  }

  async function lockedQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const result = await queryIterator(key, queryLockedTokens)
    sortLocked(result)

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
    const result = await queryIterator(key, queryMyTrades)
    sortTrades(result)
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

  function sortOwned(pairs: IdeaTokenMarketPair[]) {
    if (table === 'holdings') {
      const strCmpFunc = sortStringByOrder(orderDirection)
      const numCmpFunc = sortNumberByOrder(orderDirection)

      if (orderBy === 'name') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.token.name, rhs.token.name)
        })
      } else if (orderBy === 'market') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.market.name, rhs.market.name)
        })
      } else if (orderBy === 'price') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(
            parseFloat(lhs.token.supply),
            parseFloat(rhs.token.supply)
          )
        })
      } else if (orderBy === 'change') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(
            parseFloat(lhs.token.dayChange),
            parseFloat(rhs.token.dayChange)
          )
        })
      } else if (orderBy === 'balance') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(parseFloat(lhs.balance), parseFloat(rhs.balance))
        })
      } else if (orderBy === 'value') {
        pairs.sort((lhs, rhs) => {
          const lhsValue =
            parseFloat(
              web3BNToFloatString(
                calculateCurrentPriceBN(
                  lhs.token.rawSupply,
                  lhs.market.rawBaseCost,
                  lhs.market.rawPriceRise,
                  lhs.market.rawHatchTokens
                ),
                bigNumberTenPow18,
                2
              )
            ) * parseFloat(lhs.balance)

          const rhsValue =
            parseFloat(
              web3BNToFloatString(
                calculateCurrentPriceBN(
                  rhs.token.rawSupply,
                  rhs.market.rawBaseCost,
                  rhs.market.rawPriceRise,
                  rhs.market.rawHatchTokens
                ),
                bigNumberTenPow18,
                2
              )
            ) * parseFloat(rhs.balance)

          return numCmpFunc(lhsValue, rhsValue)
        })
      }
    }
  }

  function sortListings(pairs: IdeaTokenMarketPair[]) {
    if (table === 'listings') {
      const strCmpFunc = sortStringByOrder(orderDirection)
      const numCmpFunc = sortNumberByOrder(orderDirection)

      if (orderBy === 'name') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.token.name, rhs.token.name)
        })
      } else if (orderBy === 'market') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.market.name, rhs.market.name)
        })
      } else if (orderBy === 'price' || orderBy === 'income') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(
            parseFloat(lhs.token.supply),
            parseFloat(rhs.token.supply)
          )
        })
      } else if (orderBy === 'change') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(
            parseFloat(lhs.token.dayChange),
            parseFloat(rhs.token.dayChange)
          )
        })
      }
    }
  }

  function sortLocked(pairs: LockedIdeaTokenMarketPair[]) {
    if (table === 'locked') {
      const strCmpFunc = sortStringByOrder(orderDirection)
      const numCmpFunc = sortNumberByOrder(orderDirection)

      if (orderBy === 'name') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.token.name, rhs.token.name)
        })
      } else if (orderBy === 'market') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.market.name, rhs.market.name)
        })
      } else if (orderBy === 'price') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(
            parseFloat(lhs.token.supply),
            parseFloat(rhs.token.supply)
          )
        })
      } else if (orderBy === 'lockedUntil') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(lhs.lockedUntil, rhs.lockedUntil)
        })
      } else if (orderBy === 'balance') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(parseFloat(lhs.balance), parseFloat(rhs.balance))
        })
      } else if (orderBy === 'value') {
        pairs.sort((lhs, rhs) => {
          const lhsValue =
            parseFloat(
              web3BNToFloatString(
                calculateCurrentPriceBN(
                  lhs.token.rawSupply,
                  lhs.market.rawBaseCost,
                  lhs.market.rawPriceRise,
                  lhs.market.rawHatchTokens
                ),
                bigNumberTenPow18,
                2
              )
            ) * parseFloat(lhs.balance)

          const rhsValue =
            parseFloat(
              web3BNToFloatString(
                calculateCurrentPriceBN(
                  rhs.token.rawSupply,
                  rhs.market.rawBaseCost,
                  rhs.market.rawPriceRise,
                  rhs.market.rawHatchTokens
                ),
                bigNumberTenPow18,
                2
              )
            ) * parseFloat(rhs.balance)

          return numCmpFunc(lhsValue, rhsValue)
        })
      }
    }
  }

  function sortTrades(pairs: IdeaTokenTrade[]) {
    if (table === 'trades') {
      const strCmpFunc = sortStringByOrder(orderDirection)
      const numCmpFunc = sortNumberByOrder(orderDirection)

      if (orderBy === 'name') {
        pairs.sort((lhs, rhs) => {
          return strCmpFunc(lhs.token.name, rhs.token.name)
        })
      } else if (orderBy === 'type') {
        pairs.sort((lhs: any, rhs: any) => {
          return numCmpFunc(lhs.isBuy, rhs.isBuy)
        })
      } else if (orderBy === 'amount') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(lhs.ideaTokenAmount, rhs.ideaTokenAmount)
        })
      } else if (orderBy === 'purchaseValue') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(lhs.daiAmount, rhs.daiAmount)
        })
      } else if (orderBy === 'currentValue') {
        pairs.sort((lhs, rhs) => {
          const tokenSupplyLeft = lhs?.isBuy
            ? lhs?.token.rawSupply
            : lhs?.token.rawSupply.add(lhs?.rawIdeaTokenAmount)
          const ideaTokenValueLeft = parseFloat(
            web3BNToFloatString(
              calculateIdeaTokenDaiValue(
                tokenSupplyLeft,
                lhs?.market,
                lhs?.rawIdeaTokenAmount
              ),
              bigNumberTenPow18,
              2
            )
          )
          const tokenSupplyRight = rhs?.isBuy
            ? rhs?.token.rawSupply
            : rhs?.token.rawSupply.add(rhs?.rawIdeaTokenAmount)
          const ideaTokenValueRight = parseFloat(
            web3BNToFloatString(
              calculateIdeaTokenDaiValue(
                tokenSupplyRight,
                rhs?.market,
                rhs?.rawIdeaTokenAmount
              ),
              bigNumberTenPow18,
              2
            )
          )
          return numCmpFunc(ideaTokenValueLeft, ideaTokenValueRight)
        })
      } else if (orderBy === 'pnl') {
        pairs.sort((lhs, rhs) => {
          const tokenSupplyLeft = lhs?.isBuy
            ? lhs?.token.rawSupply
            : lhs?.token.rawSupply.add(lhs?.rawIdeaTokenAmount)
          const ideaTokenValueLeft = parseFloat(
            web3BNToFloatString(
              calculateIdeaTokenDaiValue(
                tokenSupplyLeft,
                lhs?.market,
                lhs?.rawIdeaTokenAmount
              ),
              bigNumberTenPow18,
              2
            )
          )
          const pnlNumberLeft = ideaTokenValueLeft - lhs.daiAmount
          const pnlPercentageLeft = (pnlNumberLeft / lhs.daiAmount) * 100

          const tokenSupplyRight = rhs?.isBuy
            ? rhs?.token.rawSupply
            : rhs?.token.rawSupply.add(rhs?.rawIdeaTokenAmount)
          const ideaTokenValueRight = parseFloat(
            web3BNToFloatString(
              calculateIdeaTokenDaiValue(
                tokenSupplyRight,
                rhs?.market,
                rhs?.rawIdeaTokenAmount
              ),
              bigNumberTenPow18,
              2
            )
          )
          const pnlNumberRight = ideaTokenValueRight - rhs.daiAmount
          const pnlPercentageRight = (pnlNumberRight / rhs.daiAmount) * 100

          return numCmpFunc(pnlPercentageLeft, pnlPercentageRight)
        })
      } else if (orderBy === 'date') {
        pairs.sort((lhs, rhs) => {
          return numCmpFunc(lhs.timestamp, rhs.timestamp)
        })
      }
    }
  }

  function getFinalAddresses() {
    switch (walletState) {
      case 'public':
        return verifiedAddresses
      case 'signedIn':
        return userData?.ethAddresses
      case 'signedOut':
        return [{ address, verified: false }]
    }
  }

  function headerClicked(headerValue: string) {
    if (orderBy === headerValue) {
      if (orderDirection === 'asc') {
        setOrderDirection('desc')
      } else {
        setOrderDirection('asc')
      }
    } else {
      setOrderBy(headerValue)
      setOrderDirection('desc')
    }
  }

  return (
    <div className="w-full h-full mt-8">
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="hidden py-3 text-3xl font-semibold border-gray-100 sm:block sm:border-b dark:border-gray-400">
          Wallet
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
              title={`$${+ownedTokenTotalValue + +lockedTokenTotalValue}`}
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
                  setOrderBy('price')
                  setOrderDirection('desc')
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
                  setOrderBy('price')
                  setOrderDirection('desc')
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
                  setOrderBy('lockedUntil')
                  setOrderDirection('asc')
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
                  setOrderBy('date')
                  setOrderDirection('desc')
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
            <OwnedTokenTableNew
              rawPairs={ownedPairs}
              isPairsDataLoading={isOwnedPairsDataLoading}
              refetch={refetch}
              canFetchMore={canFetchMoreOwned}
              orderDirection={orderDirection}
              orderBy={orderBy}
              fetchMore={fetchMoreOwned}
              headerClicked={headerClicked}
              userData={userData}
            />
          )}
          {table === 'listings' && web3 !== undefined && (
            <MyTokenTableNew
              rawPairs={listingPairs}
              isPairsDataLoading={isListingsPairsDataLoading}
              canFetchMore={canFetchMoreListings}
              orderDirection={orderDirection}
              orderBy={orderBy}
              fetchMore={fetchMoreListings}
              headerClicked={headerClicked}
              userData={userData}
            />
          )}

          {table === 'locked' && web3 !== undefined && (
            <LockedTokenTableNew
              rawPairs={lockedPairs}
              isPairsDataLoading={isLockedPairsDataLoading}
              canFetchMore={canFetchMoreLocked}
              orderDirection={orderDirection}
              orderBy={orderBy}
              fetchMore={fetchMoreLocked}
              headerClicked={headerClicked}
              userData={userData}
            />
          )}
          {table === 'trades' && web3 !== undefined && (
            <MyTradesTableNew
              rawPairs={myTrades}
              isPairsDataLoading={isTradesPairsDataLoading}
              canFetchMore={canFetchMoreTrades}
              orderDirection={orderDirection}
              orderBy={orderBy}
              fetchMore={fetchMoreTrades}
              headerClicked={headerClicked}
              userData={userData}
            />
          )}
        </div>
      </div>
    </div>
  )
}
