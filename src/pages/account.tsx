import classNames from 'classnames'
import { useState, useContext, useEffect } from 'react'
import {
  MarketSelect,
  Footer,
  OwnedTokenTable,
  MyTokenTable,
} from '../components'
import { useWalletStore } from '../store/walletStore'
import { GlobalContext } from 'pages/_app'
import { formatNumber } from 'utils'

export default function MyTokens() {
  const web3 = useWalletStore((state) => state.web3)
  const { setIsWalletModalOpen } = useContext(GlobalContext)

  const [ownedTokensTablePage, setOwnedTokensTablePage] = useState(0)
  const [selectedMarketOwnedTokens, setSelectedMarketOwnedTokens] = useState(
    undefined
  )
  const [ownedTokenTotalValue, setOwnedTokensTotalValue] = useState('0.00')

  const [myTokensTablePage, setMyTokensTablePage] = useState(0)
  const [selectedMarketMyTokens, setSelectedMarketMyTokens] = useState(
    undefined
  )

  const [table, setTable] = useState('holdings')
  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="h-64 px-4 pt-8 pb-5 text-white md:px-6 md:pt-6 bg-top-mobile md:bg-top-desktop md:h-96">
        <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
          <div className="flex justify-between">
            <div className="text-2xl font-semibold flex flex-col justify-end mb-2.5">
              My Wallet
            </div>
            <div className="text-center ">
              <div className="text-sm font-semibold text-brand-gray text-opacity-60">
                Total Value
              </div>
              <div
                className="text-2xl mb-2.5 font-semibold uppercase"
                title={'$' + ownedTokenTotalValue}
              >
                ${formatNumber(ownedTokenTotalValue)}
              </div>
            </div>
          </div>
          <div className="pt-2 bg-white border rounded-md border-brand-border-gray">
            <div className="flex flex-col mx-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div
                  className={classNames(
                    'text-base text-brand-new-dark font-semibold px-2 mr-5 py-3 pt-2 inline-block cursor-pointer',
                    table === 'holdings'
                      ? 'border-b-2 border-brand-new-dark'
                      : ''
                  )}
                  onClick={() => {
                    setSelectedMarketOwnedTokens(undefined)
                    setTable('holdings')
                  }}
                >
                  My Holdings
                </div>
                <div
                  className={classNames(
                    'text-base text-brand-new-dark font-semibold px-2 py-3 pt-2 inline-block cursor-pointer',
                    table === 'listings'
                      ? 'border-b-2 border-brand-new-dark'
                      : ''
                  )}
                  onClick={() => {
                    setSelectedMarketMyTokens(undefined)
                    setTable('listings')
                  }}
                >
                  My Listings
                </div>
              </div>
              <div
                className="w-48 pt-6 pr-0 mb-4 md:w-80 md:pt-0 md:mb-0"
                style={{ marginTop: -8 }}
              >
                {table === 'holdings' && (
                  <MarketSelect
                    isClearable={true}
                    onChange={(value) => {
                      setMyTokensTablePage(0)
                      setSelectedMarketOwnedTokens(value?.market)
                    }}
                    disabled={false}
                  />
                )}
                {table === 'listings' && (
                  <MarketSelect
                    isClearable={true}
                    onChange={(value) => {
                      setMyTokensTablePage(0)
                      setSelectedMarketMyTokens(value?.market)
                    }}
                    disabled={false}
                  />
                )}
              </div>
            </div>
            <div className="border-t border-brand-border-gray shadow-home ">
              {!web3 && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true)
                    }}
                    className="my-40 p-2.5 text-base font-medium text-white border-2 rounded-lg border-brand-blue tracking-tightest-2 font-sf-compact-medium bg-brand-blue"
                  >
                    Connect Wallet to View
                  </button>
                </div>
              )}
              {table === 'holdings' && web3 !== undefined && (
                <OwnedTokenTable
                  market={selectedMarketOwnedTokens}
                  currentPage={ownedTokensTablePage}
                  setCurrentPage={setOwnedTokensTablePage}
                  setTotalValue={setOwnedTokensTotalValue}
                />
              )}
              {table === 'listings' && web3 !== undefined && (
                <MyTokenTable
                  currentPage={myTokensTablePage}
                  setCurrentPage={setMyTokensTablePage}
                  market={selectedMarketMyTokens}
                />
              )}
            </div>
          </div>
          <div className="px-1 mt-12">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
