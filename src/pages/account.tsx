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
  const address = useWalletStore((state) => state.address)
  const { setIsWalletModalOpen } = useContext(GlobalContext)

  useEffect(() => {
    !address && setIsWalletModalOpen(true)
  }, [])

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
      <div className="px-4 md:px-6 pt-8 md:pt-6 pb-5 text-white bg-top-mobile md:bg-top-desktop h-64 md:h-96">
        <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
          <div className="flex justify-between">
            <div className="text-2xl mb-10 font-semibold">My Tokens</div>
            <div className=" text-center">
              <div className="text-sm font-semibold text-brand-gray text-opacity-60">
                Total Value
              </div>
              <div
                className="text-2xl mb-10 font-semibold uppercase"
                title={'$' + ownedTokenTotalValue}
              >
                ${formatNumber(ownedTokenTotalValue)}
              </div>
            </div>
          </div>
          {/* <div className="text-sm font-semibold mb-10">
            Holding: 14 tokens | Listing: 1 token
          </div> */}
          <div className="pt-2 bg-white border rounded-md border-brand-border-gray">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mx-5">
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
                className="w-48 pr-0 md:w-80 pt-6 mb-4 md:pt-0 md:mb-0"
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
              {table === 'holdings' && (
                <OwnedTokenTable
                  market={selectedMarketOwnedTokens}
                  currentPage={ownedTokensTablePage}
                  setCurrentPage={setOwnedTokensTablePage}
                  setTotalValue={setOwnedTokensTotalValue}
                />
              )}
              {table === 'listings' && (
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
