import { flatten } from 'lodash'
import classNames from 'classnames'
import BN from 'bn.js'
import { useState, useEffect } from 'react'
import { useInfiniteQuery } from 'react-query'
import {
  OwnedTokenTableNew,
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
  IdeaTokenTrade,
  IdeaTokenMarketPair,
  useIdeaMarketsStore,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import { sortNumberByOrder, sortStringByOrder } from 'components/tokens/utils'
import WalletFilters from './WalletFilters'
import { useMarketStore } from 'store/markets'

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
  walletState: string // This stores whether wallet is on public page or account page
  userData?: any
}

export default function ProfileWallet({ walletState, userData }: Props) {
  const web3 = useWalletStore((state) => state)
  const address = useWalletStore((state) => state.address)

  const [isVerifiedFilterActive, setIsVerifiedFilterActive] = useState(false)
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false)
  const [isLockedFilterActive, setIsLockedFilterActive] = useState(false)
  const [selectedMarkets, setSelectedMarkets] = useState(new Set([]))
  const [nameSearch, setNameSearch] = useState('')
  const [ownedTokenTotalValue, setOwnedTokensTotalValue] = useState('0.00')
  const [lockedTokenTotalValue, setLockedTokensTotalValue] = useState('0.00')
  const [purchaseTotalValue, setPurchaseTotalValue] = useState('0.00')

  const [table, setTable] = useState('holdings')
  const [orderBy, setOrderBy] = useState('price')
  const [orderDirection, setOrderDirection] = useState('desc')

  const watchingTokens = Object.keys(
    useIdeaMarketsStore((store) => store.watching)
  )

  const filterTokens = isStarredFilterActive ? watchingTokens : undefined

  const allMarkets = useMarketStore((state) => state.markets)
  const marketNames = allMarkets.map((m) => m?.market?.name)

  useEffect(() => {
    const storedMarkets = JSON.parse(localStorage.getItem('STORED_MARKETS'))

    const initialMarkets = storedMarkets
      ? [...storedMarkets]
      : ['All', ...marketNames]

    setSelectedMarkets(new Set(initialMarkets))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    address,
    web3,
    orderBy,
    orderDirection,
    userData,
    selectedMarkets,
    allMarkets,
    isStarredFilterActive,
    isLockedFilterActive,
    nameSearch,
  ])

  /*
   * @return list of tokens from all ETH addresses
   */
  const queryIterator = async (key, queryFunction) => {
    // Addresses that will be displayed in the tables
    const finalAddresses = getFinalAddresses()
    const filteredMarkets = allMarkets
      .map((m) => m?.market)
      .filter((m) => selectedMarkets.has(m.name))
    let result = []
    for (let i = 0; i < finalAddresses?.length; i++) {
      const queryResult = await queryFunction(
        key,
        finalAddresses[i]?.address,
        filteredMarkets,
        filterTokens,
        nameSearch
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

  function refetch() {
    refetchOwned()
    refetchMyTrades()
  }

  /**
   * TODO: make more efficient
   * @param array Contains data of all user's held AND locked tokens in one array
   * @returns new array with duplicate token pairs combined into one array object
   */
  const removeDuplicateRows = (pairs: IdeaTokenMarketPair[]) => {
    const seenElements = []
    const duplicateElements = [] // Includes duplicate tokens except the very 1st one seen

    pairs.forEach((pair) => {
      const isPairSeen = seenElements.find(
        (ele) => ele.token.address === pair.token.address
      )
      if (isPairSeen) {
        duplicateElements.push(pair)
      } else {
        seenElements.push(pair)
      }
    })

    const uniqueElements = pairs.filter(
      (pair) =>
        !duplicateElements.find(
          (dup) => dup.token.address === pair.token.address
        )
    )

    const finalPairs = []
    pairs.forEach((pair) => {
      const isUniqueElement = uniqueElements.find(
        (ele) => ele.token.address === pair.token.address
      )
      const isSeenElement = finalPairs.find(
        (ele) => ele.token.address === pair.token.address
      )
      const isDuplicateElement = duplicateElements.find(
        (ele) => ele.token.address === pair.token.address
      )
      if (isUniqueElement) {
        finalPairs.push(pair)
      } else if (isDuplicateElement && !isSeenElement) {
        // Add new pair with newly calculated values to combine all rows into 1 row visually in table
        const allDupsWithThisAddress = duplicateElements.filter(
          (dup) => dup.token.address === pair.token.address
        )
        // Since held tokens have locked tokens appended to them, held will always come first. So these will always be locked tokens
        const dupLockedBalance = allDupsWithThisAddress.reduce(
          (a, b) => parseFloat(a) + parseFloat(b.balance),
          0
        )
        const newBalance = parseFloat(pair.balance) + dupLockedBalance
        const newRawBalance = new BN(newBalance)
        const newPair = {
          ...pair,
          balance: newBalance.toString(),
          rawBalance: newRawBalance,
          lockedAmount: dupLockedBalance,
        }
        finalPairs.push(newPair)
      }
    })

    return finalPairs
  }

  async function ownedQueryFunction(
    key: string,
    numTokens: number,
    skip: number = 0
  ) {
    const ownedResults = await queryIterator(key, queryOwnedTokensMaybeMarket)
    const lockedResults = await queryIterator(key, queryLockedTokens)
    const combinedResults = ownedResults.concat(lockedResults)
    // If there are any duplicate tokens, need to combine them into 1 ROW with different data. Balance will be added up for all dup tokens. Need to add prop for lockedAmount
    const finalPairs = removeDuplicateRows(combinedResults)
    const filteredResults = isLockedFilterActive
      ? finalPairs.filter((p) => p.lockedAmount)
      : finalPairs
    sortOwned(filteredResults)

    // Calculate the total value of non-locked tokens
    let ownedTotal = new BN('0')
    for (const pair of ownedResults ?? []) {
      ownedTotal = ownedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }
    setOwnedTokensTotalValue(
      ownedResults
        ? web3BNToFloatString(ownedTotal, bigNumberTenPow18, 18)
        : '0.00'
    )

    // Calculate the total value of locked tokens
    let lockedTotal = new BN('0')
    for (const pair of lockedResults ?? []) {
      lockedTotal = lockedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }
    setLockedTokensTotalValue(
      lockedResults
        ? web3BNToFloatString(lockedTotal, bigNumberTenPow18, 18)
        : '0.00'
    )

    const lastIndex =
      numTokens + skip > filteredResults?.length
        ? filteredResults?.length
        : numTokens + skip

    return filteredResults?.slice(skip, lastIndex) || []
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
        return [{ address: userData?.walletAddress, verified: true }]
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

  const onMarketChanged = (markets) => {
    localStorage.setItem('STORED_MARKETS', JSON.stringify([...markets]))
    setSelectedMarkets(markets)
  }

  return (
    <div className="w-full h-full mt-8 pb-20">
      <div className="flex flex-col justify-between sm:flex-row mb-0 md:mb-4">
        <div className="flex order-1 md:order-none">
          <div
            className={classNames(
              table === 'holdings'
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 pr-6 ml-auto'
            )}
            onClick={() => {
              setTable('holdings')
            }}
          >
            Wallet Holdings
          </div>
          <div
            className={classNames(
              table === 'trades'
                ? 'text-white'
                : 'text-brand-gray text-opacity-60 cursor-pointer',
              'text-lg font-semibold flex flex-col justify-end mb-2.5 mr-auto'
            )}
            onClick={() => {
              setTable('trades')
            }}
          >
            Trades History
          </div>
        </div>
        <div className="flex mb-6 md:mb-0">
          <div className="pr-6 text-center ml-auto">
            <div className="text-xs font-normal text-brand-gray text-opacity-60 max-w-[6rem] md:max-w-none">
              Total Purchase Value
            </div>
            <div
              className="text-lg mb-2.5 font-semibold uppercase"
              title={'$' + +purchaseTotalValue}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                (+purchaseTotalValue).toFixed(2)
              )}
            </div>
          </div>

          <div className="pr-6 text-center">
            <div className="text-xs font-normal text-brand-gray text-opacity-60 max-w-[6rem] md:max-w-none">
              Total Current Value
            </div>
            <div
              className="text-lg mb-2.5 font-semibold uppercase"
              title={`$${+ownedTokenTotalValue + +lockedTokenTotalValue}`}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                (+ownedTokenTotalValue + +lockedTokenTotalValue).toFixed(2)
              )}
            </div>
          </div>

          {/* <div className="text-center mr-auto flex flex-col">
            <div className="text-xs font-normal text-brand-gray text-opacity-60 max-w-[6rem] md:max-w-none mt-auto">
              Profit & Loss
            </div>
            <div
              className="text-lg mb-2.5 font-semibold uppercase text-green-1"
              title={`$${+ownedTokenTotalValue + +lockedTokenTotalValue}`}
            >
              +$
              {formatNumberWithCommasAsThousandsSerperator(
                (+ownedTokenTotalValue + +lockedTokenTotalValue).toFixed(2)
              )}
            </div>
          </div> */}
        </div>
      </div>

      <div className="bg-white border rounded-md dark:bg-gray-700 dark:border-gray-500 border-brand-border-gray ">
        <WalletFilters
          selectedMarkets={selectedMarkets}
          isVerifiedFilterActive={isVerifiedFilterActive}
          isStarredFilterActive={isStarredFilterActive}
          isLockedFilterActive={isLockedFilterActive}
          nameSearch={nameSearch}
          onMarketChanged={onMarketChanged}
          onNameSearchChanged={setNameSearch}
          setIsVerifiedFilterActive={setIsVerifiedFilterActive}
          setIsStarredFilterActive={setIsStarredFilterActive}
          setIsLockedFilterActive={setIsLockedFilterActive}
        />
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
          {table === 'holdings' &&
            !selectedMarkets?.has('None') &&
            web3 !== undefined && (
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

          {table === 'trades' &&
            !selectedMarkets?.has('None') &&
            web3 !== undefined && (
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
