import classNames from 'classnames'
import { useMarketStore } from 'store/markets'
import { ChevronDownIcon, BadgeCheckIcon } from '@heroicons/react/solid'
import {
  StarIcon,
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
  toggleMarketHelper,
} from './utils/OverviewUtils'
import { useMixPanel } from 'utils/mixPanel'

type DropdownButtonProps = {
  filters: any
  name: string
  selectedOptions: any
  toggleOption: (marketValue: string) => void
  className?: string
}

// filters = options to appear in the dropdown
const DropdownButton = ({
  filters,
  name,
  selectedOptions,
  toggleOption,
  className,
}: DropdownButtonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const container = useRef(null)
  const { mixpanel } = useMixPanel()

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
        `relative flex items-center p-1 border rounded-md pl-3 pr-1 font-semibold text-sm text-brand-black dark:text-gray-50 cursor-pointer z-40`
      )}
      onClick={() => {
        setIsDropdownOpen(true)
      }}
    >
      <span className="mr-1">{name}</span>
      {name === 'Platforms' && (
        <span className="w-8 text-xs text-center text-gray-400">
          {
            [...selectedOptions].filter((o) => o !== 'All' && o !== 'None')
              .length
          }{' '}
          / {filters.length - 1}
        </span>
      )}
      <ChevronDownIcon className="h-5" />
      {isDropdownOpen && (
        <div
          ref={container}
          className="absolute z-40 flex flex-col flex-wrap w-32 p-4 mt-1 bg-white border rounded-lg shadow-xl cursor-default max-h-36 md:w-64 dark:bg-gray-800"
          style={{ top: '100%', left: 0 }}
        >
          {filters.map((filter) => (
            <span key={filter}>
              <input
                type="checkbox"
                id={`checkbox-${filter}`}
                className="border-2 border-gray-200 rounded-sm cursor-pointer"
                checked={
                  selectedOptions.has(filter) || selectedOptions.has('All')
                }
                onChange={(e) => {
                  toggleOption(filter)
                  mixpanel.track('FILTER_PLATFORM', { platforms: filters })
                }}
              />
              <label
                htmlFor={`checkbox-${filter}`}
                className={classNames(
                  'ml-2 cursor-pointer font-medium',
                  selectedOptions.has(filter) || selectedOptions.has('All')
                    ? 'text-brand-blue dark:text-blue-400'
                    : 'text-brand-black'
                )}
              >
                {filter}
              </label>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

type FiltersButtonProps = {
  filter: any
  isSelected: boolean
  isVerifiedFilterActive: boolean
  onClick: (filterId: number) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
}

const FiltersButton = ({
  filter,
  isSelected,
  isVerifiedFilterActive,
  onClick,
  setIsVerifiedFilterActive,
}: FiltersButtonProps) => {
  const { mixpanel } = useMixPanel()

  function getButtonIcon(filterId: number) {
    switch (filterId) {
      case 1:
        return <ArrowSmUpIcon className="w-4 h-4 stroke-current" />
      case 2:
        return <FireIcon className="w-4 h-4 mr-1" />
      case 3:
        return <SparklesIcon className="w-4 h-4 mr-1" />
      case 4:
        return <BadgeCheckIcon className="w-5 h-5 mr-1" />
      case 5:
        return <StarIcon className="w-4 h-4 mr-1" />
      default:
        return <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
    }
  }

  return (
    <button
      className={classNames(
        'flex flex-grow md:flex-auto justify-center items-center md:px-3 p-2 border md:rounded-md text-sm font-semibold',
        filter.value === 'Verified' && 'hidden md:flex',
        filter.value === 'Top' && 'rounded-l-md',
        filter.value === 'Starred' && 'rounded-r-md',
        {
          'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
            isSelected,
        },
        { 'text-brand-black dark:text-gray-50': !isSelected }
      )}
      onClick={() => {
        if (filter.value === 'Verified') {
          setIsVerifiedFilterActive(true)
        } else if (isVerifiedFilterActive) {
          setIsVerifiedFilterActive(false)
        }
        onClick(filter.id)

        mixpanel.track(`FILTER_${filter.value.toUpperCase()}`)
      }}
    >
      {getButtonIcon(filter.id)}
      <span>{filter.value}</span>
    </button>
  )
}

type OverviewFiltersProps = {
  selectedFilterId: number
  selectedMarkets: Set<string>
  selectedColumns: Set<string>
  isVerifiedFilterActive: boolean
  onMarketChanged: (set: Set<string>) => void
  setSelectedFilterId: (filterId: number) => void
  onColumnChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
}

export const OverviewFilters = ({
  selectedFilterId,
  selectedMarkets,
  selectedColumns,
  isVerifiedFilterActive,
  onMarketChanged,
  setSelectedFilterId,
  onColumnChanged,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
}: OverviewFiltersProps) => {
  const toggleMarket = (marketName: string) => {
    const newSet = toggleMarketHelper(marketName, selectedMarkets)
    onMarketChanged(newSet)
  }

  const toggleColumn = (columnName: string) => {
    const newSet = new Set(selectedColumns)

    if (newSet.has(columnName)) {
      newSet.delete(columnName)
      if (columnName === 'All') {
        // Remove all other options too
        newSet.clear()
      }
      if (newSet.has('All') && columnName !== 'All') {
        // Remove 'All' option if any option is removed
        newSet.delete('All')
      }
    } else {
      if (columnName === 'All') {
        CheckboxFilters.COLUMNS.values.forEach((column) => {
          if (!newSet.has(column)) {
            newSet.add(column)
          }
        })
      } else {
        newSet.add(columnName)
        // If all options selected, make sure the 'All' option is selected too
        if (CheckboxFilters.COLUMNS.values.length - newSet.size === 1) {
          newSet.add('All')
        }
      }
    }

    onColumnChanged(newSet)
  }

  function onFilterChanged(filterId: number) {
    setSelectedFilterId(filterId)
  }

  const markets = useMarketStore((state) =>
    state.markets.map((m) => m?.market?.name)
  )

  const [numActiveFilters, setNumActiveFilters] = useState(0)

  useEffect(() => {
    // toggleMarket method is dependent on CheckboxFilters.PLATFORMS.values
    CheckboxFilters.PLATFORMS.values = ['All', ...markets]
  }, [markets])

  return (
    <div className="justify-center p-3 overflow-x-scroll bg-white rounded-t-lg md:flex dark:bg-gray-700 gap-x-2 gap-y-2 md:justify-start lg:overflow-x-visible">
      <div className="flex md:gap-x-2">
        {Object.values(MainFilters).map(
          (filter: { id: number; value: string }) => (
            <FiltersButton
              key={filter.id}
              filter={filter}
              isVerifiedFilterActive={isVerifiedFilterActive}
              onClick={onFilterChanged}
              setIsVerifiedFilterActive={setIsVerifiedFilterActive}
              isSelected={filter.id === selectedFilterId}
            />
          )
        )}
      </div>

      <DropdownButton
        className="hidden md:flex"
        filters={CheckboxFilters.PLATFORMS.values}
        name={CheckboxFilters.PLATFORMS.name}
        selectedOptions={selectedMarkets}
        toggleOption={toggleMarket}
      />

      <DropdownButton
        className="hidden md:flex"
        filters={CheckboxFilters.COLUMNS.values}
        name={CheckboxFilters.COLUMNS.name}
        selectedOptions={selectedColumns}
        toggleOption={toggleColumn}
      />

      <div className="flex w-full mt-2 ml-auto md:mt-0">
        <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        <button
          className="flex items-center justify-center p-2 ml-2 text-sm font-semibold border rounded-md md:hidden"
          onClick={() => {
            ModalService.open(OverviewFiltersModal, {
              selectedMarkets,
              onMarketChanged,
              isVerifiedFilterActive,
              setIsVerifiedFilterActive,
              setNumActiveFilters,
            })
          }}
        >
          <span>Filters</span>
          {numActiveFilters !== 0 && (
            <div className="px-1 ml-2 bg-gray-200 rounded text-brand-blue">
              {numActiveFilters}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
