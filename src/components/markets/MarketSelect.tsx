import { useState, useEffect } from 'react'
import Select from 'react-select'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { useQuery } from 'react-query'
import { queryMarkets } from 'store/ideaMarketsStore'
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
  const { theme, setTheme } = useTheme()
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
    <div className="flex items-center">
      <div>
        {entry?.market?.name
          ? getMarketSpecificsByMarketName(
              entry.market.name
            ).getMarketSVGBlack()
          : ''}
      </div>
      <div className="ml-2.5">{entry.market.name}</div>
    </div>
  )

  return (
    <Select
      isDisabled={disabled}
      isClearable={isClearable}
      isSearchable={false}
      onChange={onChange}
      options={selectMarketValues}
      formatOptionLabel={selectMarketFormat}
      defaultValue={isMarketsLoading ? undefined : selectMarketValues[0]}
      className="border-2 border-gray-200  dark:border-gray-500  dark:placeholder-gray-300 rounded-md text-brand-gray-4 dark:text-gray-200 market-select"
      theme={(mytheme) => ({
        ...mytheme,
        borderRadius: 2,
        colors: {
          ...mytheme.colors,
          primary25: theme === 'dark' ? 'black' : '#f6f6f6', // brand-gray
          primary: '#0857e0', // brand-blue
        },
      })}
      styles={{
        valueContainer: (provided) => ({
          ...provided,
          minHeight: '50px',
        }),
        control: (base, state) => ({
          ...base,
          textDecorationColor: theme === 'dark' ? 'white' : 'gray',
          background: theme === 'dark' ? 'gray' : 'white',
          // match with the menu
          borderRadius: state.isFocused ? '3px 3px 0 0' : 3,
          // Overwrittes the different states of border
          borderColor: state.isFocused ? 'yellow' : 'green',
          // Removes weird border around container
          boxShadow: state.isFocused ? null : null,
          '&:hover': {
            // Overwrittes the different states of border
            borderColor: state.isFocused ? 'red' : 'blue',
          },
        }),
        menuList: (base) => ({
          ...base,
          background: theme === 'dark' ? 'gray' : 'white',
        }),
      }}
    />
  )
}
