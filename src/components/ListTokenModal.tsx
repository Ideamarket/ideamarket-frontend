import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { listToken } from 'actions'
import { queryMarkets } from 'store/ideaMarketsStore'

import { Modal } from './'

export default function ListTokenModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (b: boolean) => void
}) {
  const { data: markets, isLoading: isMarketsLoading } = useQuery(
    'all-markets',
    queryMarkets
  )

  const [selectMarketValues, setSelectMarketValues] = useState([])
  const [selectedMarket, setSelectedMarket] = useState(undefined)

  useEffect(() => {
    if (markets) {
      setSelectMarketValues(
        markets.map((market) => ({
          value: market.marketID.toString(),
          market: market,
        }))
      )
      setSelectedMarket(markets[0])
    } else {
      setSelectMarketValues([])
      setSelectedMarket(undefined)
    }
  }, [markets])

  const [tokenName, setTokenName] = useState('')

  const selectMarketFormat = (entry) => (
    <div className="flex items-center">
      <img className="w-7.5" src="https://youtube.com/favicon.ico" />
      <div className="ml-2.5">{entry.market.name}</div>
    </div>
  )

  function listClicked() {
    listToken(tokenName, selectedMarket.marketID)
  }

  if (!isOpen) {
    return <></>
  }

  return (
    <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
      <div className="p-4 bg-top-mobile min-w-100">
        <p className="text-2xl text-center text-gray-300 md:text-3xl font-gilroy-bold">
          List Token
        </p>
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2">Market</p>
      <div className="mx-5">
        {isMarketsLoading ? (
          ''
        ) : (
          <Select
            isClearable={false}
            isSearchable={false}
            onChange={(value) => {
              setSelectedMarket(value.token)
            }}
            options={selectMarketValues}
            formatOptionLabel={selectMarketFormat}
            defaultValue={selectMarketValues[0]}
            theme={(theme) => ({
              ...theme,
              borderRadius: 2,
              colors: {
                ...theme.colors,
                primary25: '#f6f6f6', // brand-gray
                primary: '#0857e0', // brand-blue
              },
            })}
            styles={{
              valueContainer: (provided) => ({
                ...provided,
                minHeight: '50px',
              }),
            }}
          />
        )}
      </div>
      <p className="mx-5 mt-5 text-sm text-brand-gray-2">Token Name</p>
      <div className="flex items-center mx-5">
        <div className="text-base text-brand-gray-2 text-semibold">@</div>
        <div className="flex-grow ml-0.5">
          <input
            className="w-full py-2 pl-1 pr-4 leading-tight bg-gray-200 border-2 border-gray-200 rounded appearance-none focus:outline-none focus:bg-white focus:border-brand-blue"
            onChange={(e) => {
              setTokenName(e.target.value)
            }}
          />
        </div>
      </div>
      <div className="flex justify-center mb-5">
        <button
          onClick={listClicked}
          className="w-32 h-10 mt-5 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
        >
          List Token
        </button>
      </div>
    </Modal>
  )
}
