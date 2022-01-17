import { LockClosedIcon, StarIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import {
  CheckboxFilters,
  toggleMarketHelper,
} from 'components/tokens/utils/OverviewUtils'
import useThemeMode from 'components/useThemeMode'
import { useEffect } from 'react'
import { getMarketSpecificsByMarketName, useMarketStore } from 'store/markets'

type PlatformButtonProps = {
  platform: any
  isSelected: boolean
  onClick: (platform: string) => void
}

const PlatformButton = ({
  platform,
  isSelected,
  onClick,
}: PlatformButtonProps) => {
  const marketSpecifics = getMarketSpecificsByMarketName(platform)
  const { resolvedTheme } = useThemeMode()

  return (
    <button
      className={classNames(
        'h-10 flex flex-grow md:flex-auto justify-center items-center px-3 py-2 border md:rounded-md text-sm font-semibold',
        platform === 'All' && 'rounded-l-md',
        {
          'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
            isSelected,
        },
        { 'text-brand-black dark:text-gray-50': !isSelected }
      )}
      onClick={() => {
        onClick(platform)
      }}
    >
      {platform !== 'All' && (
        <span
          className={classNames(
            marketSpecifics.getMarketName() === 'Wikipedia' ? 'mr-2' : 'mr-1',
            'w-4 h-auto'
          )}
        >
          {marketSpecifics.getMarketSVGTheme(resolvedTheme)}
        </span>
      )}
      <span>{platform}</span>
    </button>
  )
}

type FiltersButtonProps = {
  isSelected: boolean
  onClick: (value: any) => void
  label: any
  className?: string
}

const FiltersButton = ({
  isSelected,
  onClick,
  label,
  className,
}: FiltersButtonProps) => {
  return (
    <button
      className={classNames(
        className,
        'flex flex-grow md:flex-auto justify-center items-center md:px-3 p-2 border md:rounded-md text-sm font-semibold',
        {
          'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
            isSelected,
        },
        { 'text-brand-black dark:text-gray-50': !isSelected }
      )}
      onClick={() => {
        onClick(!isSelected)
      }}
    >
      <span>{label}</span>
    </button>
  )
}

type Props = {
  selectedMarkets: Set<string>
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isLockedFilterActive: boolean
  nameSearch: string
  onMarketChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setIsLockedFilterActive: (isActive: boolean) => void
}

const WalletFilters = ({
  selectedMarkets,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isLockedFilterActive,
  nameSearch,
  onMarketChanged,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setIsLockedFilterActive,
}: Props) => {
  const toggleMarket = (marketName: string) => {
    const newSet = toggleMarketHelper(marketName, selectedMarkets)
    onMarketChanged(newSet)
  }

  const markets = useMarketStore((state) =>
    state.markets.map((m) => m?.market?.name)
  )

  useEffect(() => {
    // toggleMarket method is dependent on CheckboxFilters.PLATFORMS.values
    CheckboxFilters.PLATFORMS.values = ['All', ...markets]
  }, [markets])

  return (
    <div className="justify-center p-3 overflow-x-scroll bg-white rounded-t-lg text-black md:flex dark:bg-gray-700 gap-x-2 gap-y-2 md:justify-start lg:overflow-x-visible">
      <div className="flex md:gap-x-2">
        {CheckboxFilters.PLATFORMS.values
          .sort((p1, p2) => {
            // Sort so that All is first and then Wikipedia is 2nd. Rest of order not controlled
            if (p1 === 'All') return -1
            if (p1 === 'Wikipedia' && p2 !== 'All') {
              return -1
            }

            return 1
          })
          .map((platform: string) => (
            <PlatformButton
              key={platform}
              platform={platform}
              isSelected={
                selectedMarkets ? selectedMarkets.has(platform) : false
              }
              onClick={toggleMarket}
            />
          ))}
      </div>

      {/* <FiltersButton
        className="hidden md:flex"
        onClick={setIsVerifiedFilterActive}
        isSelected={isVerifiedFilterActive}
        label={getIconVersion('verify', resolvedTheme, isVerifiedFilterActive)}
      /> */}

      <FiltersButton
        className="hidden md:flex"
        onClick={setIsStarredFilterActive}
        isSelected={isStarredFilterActive}
        label={<StarIcon className="w-5 h-5" />}
      />

      <FiltersButton
        className="hidden md:flex"
        onClick={setIsLockedFilterActive}
        isSelected={isLockedFilterActive}
        label={<LockClosedIcon className="w-5 h-5" />}
      />

      <div className="flex w-full h-9 md:h-auto mt-2 ml-auto md:mt-0">
        <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        {/* <button
          className="flex items-center justify-center p-2 ml-2 text-sm font-semibold border rounded-md md:hidden"
          onClick={() => {
            ModalService.open(OverviewFiltersModal, {
              isVerifiedFilterActive,
              isStarredFilterActive,
              selectedFilterId,
              setIsVerifiedFilterActive,
              setIsStarredFilterActive,
              setSelectedFilterId,
            })
          }}
        >
          <span>Filters</span>
        </button> */}
      </div>

      {/* <DropdownButton
        className="hidden md:flex"
        filters={CheckboxFilters.COLUMNS.values}
        name={<AdjustmentsIcon className="w-5 h-5" />}
        selectedOptions={selectedColumns}
        toggleOption={toggleColumn}
        dropdownType="columns"
      /> */}
    </div>
  )
}

export default WalletFilters
