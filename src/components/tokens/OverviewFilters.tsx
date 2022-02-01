import classNames from 'classnames'
import { getMarketSpecificsByMarketName, useMarketStore } from 'store/markets'
import { ChevronDownIcon, StarIcon } from '@heroicons/react/solid'
import {
  AdjustmentsIcon,
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import React, { useEffect, useRef, useState } from 'react'
import { OverviewSearchbar } from './OverviewSearchbar'
import ModalService from 'components/modals/ModalService'
import { OverviewFiltersModal } from 'components'
import {
  CheckboxFilters,
  MainFilters,
  toggleColumnHelper,
  toggleMarketHelper,
} from './utils/OverviewUtils'
import { useMixPanel } from 'utils/mixPanel'
import useThemeMode from 'components/useThemeMode'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import DropdownCheckbox from 'components/dropdowns/DropdownCheckbox'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { getIconVersion } from 'utils/icons'

type DropdownButtonProps = {
  filters: any
  name: any
  selectedOptions: any
  toggleOption: (value: any) => void
  className?: string
  dropdownType?: string
  selectedFilterId?: number
}

// filters = options to appear in the dropdown
const DropdownButton = ({
  filters,
  name,
  selectedOptions,
  toggleOption,
  className,
  dropdownType = 'checkbox',
  selectedFilterId,
}: DropdownButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const container = useRef(null)

  const DropdownProps = {
    container,
    filters,
    selectedOptions,
    toggleOption,
  }

  const getButtonIcon = (filterId: number) => {
    switch (filterId) {
      case 1:
        return <ArrowSmUpIcon className="w-4 h-4 stroke-current" />
      case 2:
        return <FireIcon className="w-4 h-4 mr-1" />
      case 3:
        return <SparklesIcon className="w-4 h-4 mr-1" />
      case 4:
        return <IdeaverifyIconBlue className="w-5 h-5 mr-1" />
      case 5:
        return <StarIcon className="w-4 h-4 mr-1" />
      default:
        return <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
    }
  }

  function handleClickOutside(event) {
    const value = container.current
    if (value && !value.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      className={classNames(
        className,
        dropdownType !== 'columns' ? 'pl-3' : 'pl-2',
        `relative flex items-center p-1 border rounded-md pr-1 font-semibold text-sm text-brand-black dark:text-gray-50 cursor-pointer `
      )}
      onMouseOver={() => {
        setIsDropdownOpen(true)
      }}
      onMouseLeave={() => {
        setIsDropdownOpen(false)
      }}
    >
      {dropdownType === 'buttons' && (
        <div className="flex">
          <span className="mr-1 text-xs text-gray-500 dark:text-white whitespace-nowrap">
            Sort by:
          </span>
          {getButtonIcon(selectedFilterId)}
        </div>
      )}
      <span className="mr-1">{name}</span>
      {dropdownType !== 'columns' && <ChevronDownIcon className="h-5" />}
      {isDropdownOpen && dropdownType === 'buttons' && (
        <DropdownButtons {...DropdownProps} />
      )}
      {isDropdownOpen && dropdownType !== 'buttons' && (
        <DropdownCheckbox {...DropdownProps} />
      )}
    </div>
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

type OverviewFiltersProps = {
  selectedFilterId: number
  selectedMarkets: Set<string>
  selectedColumns: Set<string>
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  onMarketChanged: (set: Set<string>) => void
  setSelectedFilterId: (filterId: number) => void
  onColumnChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
}

export const OverviewFilters = ({
  selectedFilterId,
  selectedMarkets,
  selectedColumns,
  isVerifiedFilterActive,
  isStarredFilterActive,
  onMarketChanged,
  setSelectedFilterId,
  onColumnChanged,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
}: OverviewFiltersProps) => {
  const { mixpanel } = useMixPanel()
  const { resolvedTheme } = useThemeMode()

  const toggleMarket = (marketName: string) => {
    const newSet = toggleMarketHelper(marketName, selectedMarkets)
    onMarketChanged(newSet)
    mixpanel.track('FILTER_PLATFORM', { platforms: marketName })
  }

  const toggleColumn = (columnName: string) => {
    const newSet = toggleColumnHelper(columnName, selectedColumns)
    onColumnChanged(newSet)
  }

  function onFilterChanged(filterId: number) {
    setSelectedFilterId(filterId)
  }

  const markets = useMarketStore((state) =>
    state.markets.map((m) => m?.market?.name)
  )

  useEffect(() => {
    // toggleMarket method is dependent on CheckboxFilters.PLATFORMS.values
    CheckboxFilters.PLATFORMS.values = ['All', ...markets]
  }, [markets])

  return (
    <div className="justify-center p-3 overflow-x-scroll bg-white rounded-t-lg md:flex dark:bg-gray-700 gap-x-2 gap-y-2 md:justify-start lg:overflow-x-visible">
      <div className="flex md:gap-x-2">
        {CheckboxFilters.PLATFORMS.values
          .sort((p1, p2) => {
            // Sort so that All is first and then Wikipedia is 2nd. Minds is 3rd. Rest of order not controlled
            if (p1 === 'All') return -1
            if (p1 === 'Wikipedia' && p2 !== 'All') {
              return -1
            }
            if (p1 === 'Minds' && p2 !== 'All' && p2 !== 'Wikipedia') {
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

      <FiltersButton
        className="hidden md:flex"
        onClick={setIsVerifiedFilterActive}
        isSelected={isVerifiedFilterActive}
        label={getIconVersion('verify', resolvedTheme, isVerifiedFilterActive)}
      />

      <FiltersButton
        className="hidden md:flex"
        onClick={setIsStarredFilterActive}
        isSelected={isStarredFilterActive}
        label={<StarIcon className="w-5 h-5" />}
      />

      <DropdownButton
        className="hidden md:flex"
        filters={Object.values(MainFilters)}
        name={
          Object.values(MainFilters).find(
            (filter) => filter.id === selectedFilterId
          )?.value
        }
        selectedOptions={new Set([selectedFilterId])}
        toggleOption={onFilterChanged}
        dropdownType="buttons"
        selectedFilterId={selectedFilterId}
      />

      <div className="flex w-full h-9 md:h-auto mt-2 ml-auto md:mt-0">
        <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        <button
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
          {/* {numActiveFilters !== 0 && (
            <div className="px-1 ml-2 bg-gray-200 rounded text-brand-blue">
              {numActiveFilters}
            </div>
          )} */}
        </button>
      </div>

      <DropdownButton
        className="hidden md:flex"
        filters={CheckboxFilters.COLUMNS.values}
        name={<AdjustmentsIcon className="w-5 h-5" />}
        selectedOptions={selectedColumns}
        toggleOption={toggleColumn}
        dropdownType="columns"
      />
    </div>
  )
}
