import { useState, useContext, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { MarketSelect, TokenCard, Footer, OwnedTokenTable } from '../components'
import { useWalletStore } from '../store/walletStore'
import {
  queryOwnedTokensMaybeMarket,
  queryTokensInterestReceiverMaybeMarket,
} from '../store/ideaMarketsStore'
import { GlobalContext } from 'pages/_app'

export default function MyTokens() {
  const router = useRouter()
  const address = useWalletStore((state) => state.address)
  const { setIsWalletModalOpen } = useContext(GlobalContext)

  useEffect(() => {
    !address && setIsWalletModalOpen(true)
  }, [])

  const [selectedMarketOwnedTokens, setSelectedMarketOwnedTokens] = useState(
    undefined
  )

  const [
    selectedMarketInterestReceiverTokens,
    setSelectedMarketInterestReceiverTokens,
  ] = useState(undefined)
  const {
    data: interestReceiverTokens,
    isLoading: isInterestReceiverTokensLoading,
  } = useQuery(
    [
      'query-interest-receiver-tokens-maybe-market',
      selectedMarketInterestReceiverTokens,
      address,
    ],
    queryTokensInterestReceiverMaybeMarket
  )

  return (
    <div className="min-h-screen bg-brand-gray">
      <div
        className="mx-auto"
        style={{
          maxWidth: '1500px',
        }}
      >
        <div className="min-h-screen py-5 bg-white border-b border-l border-r border-gray-400 rounded-b">
          <div className="flex items-center mx-5 pb-2.5">
            <div className="flex-grow text-2xl sm:text-3xl text-brand-gray-2">
              Tokens I Own
            </div>
            <div className="w-48 pr-0 md:w-64">
              <MarketSelect
                isClearable={true}
                onChange={(value) => {
                  setSelectedMarketOwnedTokens(value?.market)
                }}
                disabled={false}
              />
            </div>
          </div>
          <div className="mx-5 border border-gray-300 rounded">
            <OwnedTokenTable market={selectedMarketOwnedTokens} />
          </div>

          <div className="flex items-center mx-5 border-gray-400 pb-2.5 border-b mt-10">
            <div className="flex-grow text-2xl sm:text-3xl text-brand-gray-2">
              My Tokens
            </div>
            <div className="w-48 pr-0 md:w-64">
              <MarketSelect
                isClearable={true}
                onChange={(value) => {
                  setSelectedMarketInterestReceiverTokens(value?.market)
                }}
                disabled={false}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 mx-5 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isInterestReceiverTokensLoading
              ? ''
              : interestReceiverTokens.map((pair) => (
                  <div
                    key={'interest-receiver-' + pair.token.address}
                    onClick={() => {
                      router.push(`/details/${pair.token.address}`)
                    }}
                  >
                    <TokenCard
                      token={pair.token}
                      market={pair.market}
                      enabled={true}
                      classes={'bg-brand-gray'}
                    />
                  </div>
                ))}
          </div>
        </div>
        <div className="px-1">
          <Footer />
        </div>
      </div>
    </div>
  )
}
