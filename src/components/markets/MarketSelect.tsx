import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { queryMarkets } from 'store/ideaMarketsStore'
import DropDown from 'components/DropDown'
import { useTheme } from 'next-themes'

export default function MarketSelect({
  onChange,
  disabled,
  isClearable = false,
}: {
  onChange: (val: any) => void
  disabled: boolean
  isClearable?: boolean
}) {
  const [selectMarketValues, setSelectMarketValues] = useState([])
  const { theme } = useTheme()
  const { data: markets, isLoading: isMarketsLoading } = useQuery(
    'all-markets',
    queryMarkets
  )

  useEffect(() => {
    if (markets) {
      setSelectMarketValues(
        markets
          .filter(
            (market) =>
              getMarketSpecificsByMarketName(market.name) !== undefined &&
              getMarketSpecificsByMarketName(market.name).isEnabled()
          )
          .map((market) => ({
            value: market.marketID.toString(),
            market: market,
          }))
      )
    } else {
      setSelectMarketValues([])
    }
  }, [markets])

  const selectMarketFormat = (entry) => (
    <div className="flex items-center dark:text-gray-300 text-gray-500 ">
      <div>
        {entry?.market?.name
          ? theme === 'dark'
            ? getMarketSpecificsByMarketName(
                entry.market.name
              ).getMarketSVGWhite()
            : getMarketSpecificsByMarketName(
                entry.market.name
              ).getMarketSVGBlack()
          : ''}
      </div>
      <div className="ml-2.5">{entry.market.name}</div>
    </div>
  )

  return (
    <DropDown
      isDisabled={disabled}
      isClearable={isClearable}
      isSearchable={false}
      onChange={onChange}
      options={selectMarketValues}
      formatOptionLabel={selectMarketFormat}
      defaultValue={isMarketsLoading ? undefined : selectMarketValues[0]}
      className="border-2 border-gray-200  dark:border-gray-500  dark:placeholder-gray-300 rounded-md text-brand-gray-4 dark:text-gray-200 market-select"
      name=""
    />
  )
}
