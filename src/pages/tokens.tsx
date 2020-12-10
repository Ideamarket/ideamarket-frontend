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

  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="mx-auto md:px-4 max-w-88 md:max-w-304">
        <div className="min-h-screen py-5 bg-white border-b border-l border-r border-gray-400 rounded-b">
          <div className="flex items-center justify-between mx-5 pb-2.5">
            <div className="text-2xl sm:text-3xl text-brand-gray-2">
              Tokens I Own
            </div>
            <div className="text-2xl sm:text-3xl text-brand-gray-2">
              <span>Total: </span>
              <span title={'$' + ownedTokenTotalValue} className="uppercase">
                ${formatNumber(ownedTokenTotalValue)}
              </span>
            </div>
            <div className="w-48 pr-0 md:w-64">
              <MarketSelect
                isClearable={true}
                onChange={(value) => {
                  setOwnedTokensTablePage(0)
                  setSelectedMarketOwnedTokens(value?.market)
                }}
                disabled={false}
              />
            </div>
          </div>
          <div className="mx-5 border border-gray-300 rounded">
            <OwnedTokenTable
              market={selectedMarketOwnedTokens}
              currentPage={ownedTokensTablePage}
              setCurrentPage={setOwnedTokensTablePage}
              setTotalValue={setOwnedTokensTotalValue}
            />
          </div>

          <div className="flex items-center mx-5 pb-2.5 mt-10">
            <div className="flex-grow text-2xl sm:text-3xl text-brand-gray-2">
              My Tokens
            </div>
            <div className="w-48 pr-0 md:w-64">
              <MarketSelect
                isClearable={true}
                onChange={(value) => {
                  setMyTokensTablePage(0)
                  setSelectedMarketMyTokens(value?.market)
                }}
                disabled={false}
              />
            </div>
          </div>
          <div className="mx-5 border border-gray-300 rounded">
            <MyTokenTable
              currentPage={myTokensTablePage}
              setCurrentPage={setMyTokensTablePage}
              market={selectedMarketMyTokens}
            />
          </div>
        </div>
        <div className="px-1">
          <Footer />
        </div>
      </div>
    </div>
  )
}
