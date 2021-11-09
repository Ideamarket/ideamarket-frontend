import { getMarketSpecificsByMarketName, useMarketStore } from 'store/markets'
import DropDown from 'components/DropDown'
import useThemeMode from 'components/useThemeMode'

export default function MarketSelect({
  onChange,
  disabled,
  isClearable = false,
}: {
  onChange: (val: any) => void
  disabled: boolean
  isClearable?: boolean
}) {
  const { theme } = useThemeMode()

  const markets = useMarketStore((state) => state.markets)

  const selectMarketFormat = (entry) => (
    <div className="flex items-center text-gray-500 dark:text-gray-300 ">
      <div className="w-4">
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
      options={markets}
      formatOptionLabel={selectMarketFormat}
      defaultValue={undefined}
      className="border-2 border-gray-200 rounded-md dark:border-gray-500 dark:placeholder-gray-300 text-brand-gray-4 dark:text-gray-200 market-select"
      name=""
    />
  )
}
