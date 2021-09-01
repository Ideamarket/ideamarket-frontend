import classNames from 'classnames'
import BN from 'bn.js'
import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import {
  MarketSelect,
  Footer,
  OwnedTokenTable,
  MyTokenTable,
  LockedTokenTable,
  DefaultLayout,
  WalletModal,
} from '../components'
import { useWalletStore } from '../store/walletStore'
import {
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  calculateIdeaTokenDaiValue,
  bigNumberTenPow18,
} from 'utils'
import { NextSeo } from 'next-seo'
import {
  queryOwnedTokensMaybeMarket,
  queryLockedTokens,
  queryMyTrades,
} from 'store/ideaMarketsStore'
import ModalService from 'components/modals/ModalService'
import MyTradesTable from 'components/tokens/MyTradesTable/MyTradesTable'

export default function MyTokens() {
  const web3 = useWalletStore((state) => state.web3)

  const [ownedTokensTablePage, setOwnedTokensTablePage] = useState(0)
  const [selectedMarketOwnedTokens, setSelectedMarketOwnedTokens] =
    useState(undefined)
  const [ownedTokenTotalValue, setOwnedTokensTotalValue] = useState('0.00')
  const [lockedTokenTotalValue, setLockedTokensTotalValue] = useState('0.00')
  const [purchaseTotalValue, setPurchaseTotalValue] = useState('0.00')

  const [myTokensTablePage, setMyTokensTablePage] = useState(0)
  const [selectedMarketMyTokens, setSelectedMarketMyTokens] =
    useState(undefined)

  const [lockedTokensTablePage, setLockedTokensTablePage] = useState(0)
  const [selectedMarketLockedTokens, setSelectedMarketLockedTokens] =
    useState(undefined)

  const address = useWalletStore((state) => state.address)

  const {
    data: rawOwnedPairs,
    isLoading: isOwnedPairsDataLoading,
    refetch: refetchOwned,
  } = useQuery(
    ['owned-tokens', selectedMarketOwnedTokens, address],
    queryOwnedTokensMaybeMarket
  )

  const {
    data: rawLockedPairs,
    isLoading: isLockedPairsDataLoading,
    refetch: refetchLocked,
  } = useQuery(
    ['locked-tokens', selectedMarketLockedTokens, address],
    queryLockedTokens
  )

  const {
    data: myTrades,
    isLoading: isMyTradesDataLoading,
    refetch: refetchMyTrades,
  } = useQuery(
    ['my-trades', selectedMarketLockedTokens, address],
    queryMyTrades
  )

  const [table, setTable] = useState('holdings')

  useEffect(() => {
    // Calculate the total value of non-locked tokens
    let ownedTotal = new BN('0')
    for (const pair of rawOwnedPairs ?? []) {
      ownedTotal = ownedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }

    // Calculate the total value of locked tokens
    let lockedTotal = new BN('0')
    for (const pair of rawLockedPairs ?? []) {
      lockedTotal = lockedTotal.add(
        calculateIdeaTokenDaiValue(
          pair.token?.rawSupply,
          pair.market,
          pair.rawBalance
        )
      )
    }

    // Calculate the total purchase value
    let purchaseTotal = new BN('0')
    for (const pair of myTrades ?? []) {
      if (pair.isBuy) purchaseTotal = purchaseTotal.add(pair.rawDaiAmount)
    }

    setPurchaseTotalValue(
      myTrades
        ? web3BNToFloatString(purchaseTotal, bigNumberTenPow18, 18)
        : '0.00'
    )
    setOwnedTokensTotalValue(
      rawOwnedPairs
        ? web3BNToFloatString(ownedTotal, bigNumberTenPow18, 18)
        : '0.00'
    )
    setLockedTokensTotalValue(
      rawLockedPairs
        ? web3BNToFloatString(lockedTotal, bigNumberTenPow18, 18)
        : '0.00'
    )
  }, [rawOwnedPairs, rawLockedPairs, myTrades])

  function refetch() {
    refetchOwned()
    refetchLocked()
    refetchMyTrades()
  }

  return (
    <>
      <NextSeo title="Wallet" />
      <div className="min-h-screen bg-brand-gray dark:bg-gray-900 font-inter">
        <div className="h-64 px-4 pt-8 pb-5 text-white md:px-6 md:pt-6 bg-top-mobile md:bg-top-desktop md:h-96">
          <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
            <div className="flex justify-between">
              <div className="text-2xl font-semibold flex flex-col justify-end mb-2.5">
                Wallet
              </div>
              <div className="flex">
                <div className="pr-6 text-center">
                  <div className="text-sm font-semibold text-brand-gray text-opacity-60">
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
                  <div className="text-sm font-semibold text-brand-gray text-opacity-60">
                    Total Current Value
                  </div>
                  <div
                    className="text-2xl mb-2.5 font-semibold uppercase"
                    title={'$' + +ownedTokenTotalValue + +lockedTokenTotalValue}
                  >
                    $
                    {formatNumberWithCommasAsThousandsSerperator(
                      (+ownedTokenTotalValue + +lockedTokenTotalValue).toFixed(
                        2
                      )
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
                      setMyTokensTablePage(0)
                      setLockedTokensTablePage(0)
                      setOwnedTokensTablePage(0)
                      setSelectedMarketOwnedTokens(value?.market)
                      setSelectedMarketMyTokens(value?.market)
                      setSelectedMarketLockedTokens(value?.market)
                    }}
                    disabled={false}
                  />
                </div>
              </div>
              <div className="border-t border-brand-border-gray dark:border-gray-500 shadow-home ">
                {!web3 && (
                  <div className="flex items-center justify-center">
                    <button
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
                    rawPairs={rawOwnedPairs}
                    isPairsDataLoading={isOwnedPairsDataLoading}
                    currentPage={ownedTokensTablePage}
                    setCurrentPage={setOwnedTokensTablePage}
                    refetch={refetch}
                  />
                )}
                {table === 'listings' && web3 !== undefined && (
                  <MyTokenTable
                    currentPage={myTokensTablePage}
                    setCurrentPage={setMyTokensTablePage}
                    market={selectedMarketMyTokens}
                  />
                )}

                {table === 'locked' && web3 !== undefined && (
                  <LockedTokenTable
                    rawPairs={rawLockedPairs}
                    isPairsDataLoading={isLockedPairsDataLoading}
                    currentPage={lockedTokensTablePage}
                    setCurrentPage={setLockedTokensTablePage}
                  />
                )}
                {table === 'trades' && web3 !== undefined && (
                  <MyTradesTable
                    rawPairs={myTrades}
                    isPairsDataLoading={isMyTradesDataLoading}
                    currentPage={lockedTokensTablePage}
                    setCurrentPage={setLockedTokensTablePage}
                  />
                )}
              </div>
            </div>
            <div className="px-1 py-12">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

MyTokens.layoutProps = {
  Layout: DefaultLayout,
}
