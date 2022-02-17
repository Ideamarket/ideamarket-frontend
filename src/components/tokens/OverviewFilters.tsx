import classNames from 'classnames'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { ChevronDownIcon, StarIcon } from '@heroicons/react/solid'
import {
  AdjustmentsIcon,
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
  GlobeAltIcon,
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
import useThemeMode from 'components/useThemeMode'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import DropdownCheckbox from 'components/dropdowns/DropdownCheckbox'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { getIconVersion } from 'utils/icons'
import { GhostIconBlack } from 'assets'
import { useMixPanel } from 'utils/mixPanel'
import { useQuery } from 'react-query'
import { getCategories } from 'actions/web2/getCategories'

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
        'flex justify-center items-center md:px-3 p-2 md:rounded-md text-sm font-semibold',
        {
          'text-brand-blue dark:text-white bg-blue-100 border-2 border-blue-600 dark:bg-very-dark-blue':
            isSelected,
        },
        { 'text-brand-black dark:text-gray-50 border': !isSelected }
      )}
      onClick={() => {
        onClick(!isSelected)
      }}
    >
      <span>{label}</span>
    </button>
  )
}

type OverviewFiltersProps = {
  selectedFilterId: number
  selectedMarkets: Set<string>
  selectedColumns: Set<string>
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isGhostOnlyActive: boolean
  selectedCategories: string[]
  onMarketChanged: (set: Set<string>) => void
  setSelectedFilterId: (filterId: number) => void
  onColumnChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setIsGhostOnlyActive: (isActive: boolean) => void
  setSelectedCategories: (selectedCategories: string[]) => void
}

export const OverviewFilters = ({
  selectedFilterId,
  selectedMarkets,
  selectedColumns,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isGhostOnlyActive,
  selectedCategories,
  onMarketChanged,
  setSelectedFilterId,
  onColumnChanged,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setIsGhostOnlyActive,
  setSelectedCategories,
}: OverviewFiltersProps) => {
  const { mixpanel } = useMixPanel()
  const { resolvedTheme } = useThemeMode()

  const toggleMarket = (marketName: string) => {
    let newSet = null
    if (marketName === 'URL') {
      newSet = toggleMarketHelper('URL', selectedMarkets)
      newSet = toggleMarketHelper('Minds', newSet)
      newSet = toggleMarketHelper('Substack', newSet)
      newSet = toggleMarketHelper('Showtime', newSet)
      newSet = toggleMarketHelper('Wikipedia', newSet)
    } else {
      newSet = toggleMarketHelper(marketName, selectedMarkets)
    }

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

  /**
   * This method is called when a category is clicked on home table.
   * @param newClickedCategoryId -- Category ID of category just clicked
   */
  const onCategoryClicked = (newClickedCategoryId: string) => {
    const isCatAlreadySelected =
      selectedCategories.includes(newClickedCategoryId)
    let newCategories = [...selectedCategories]
    if (isCatAlreadySelected) {
      newCategories = newCategories.filter(
        (cat) => cat !== newClickedCategoryId
      )
    } else {
      newCategories.push(newClickedCategoryId)
    }
    setSelectedCategories(newCategories)
  }

  const { data: categoriesData } = useQuery([true], getCategories)

  const isURLSelected = selectedMarkets.has('URL')
  const isPeopleSelected = selectedMarkets.has('Twitter')
  const twitterMarketSpecifics = getMarketSpecificsByMarketName('Twitter')

  return (
    <div className="h-28 md:h-16 justify-center p-3 bg-white rounded-t-lg md:flex dark:bg-gray-700 gap-x-2 gap-y-2 md:justify-start">
      <div className="flex md:gap-x-2">
        {categoriesData &&
          categoriesData.map((cat: any) => (
            <FiltersButton
              className="hidden md:block"
              label={cat.name}
              isSelected={selectedCategories.includes(cat.id)}
              onClick={() => onCategoryClicked(cat.id)}
              key={cat.id}
            />
          ))}
      </div>

      <div className="flex w-full h-9 md:h-auto ml-auto">
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

      <div className="md:hidden flex justify-between items-center space-x-2 mt-2">
        <button
          className={classNames(
            'w-1/2 h-10 flex justify-center items-center md:px-3 p-2 border-2 rounded-md text-sm font-semibold',
            {
              'text-brand-blue dark:text-white bg-blue-100 border-blue-600 dark:bg-very-dark-blue':
                isURLSelected,
            },
            { 'text-brand-black dark:text-gray-50': !isURLSelected }
          )}
          onClick={() => {
            toggleMarket('URL')
          }}
        >
          <GlobeAltIcon className="w-5 mr-1" />
          <span>URLs</span>
        </button>
        <button
          className={classNames(
            'w-1/2 h-10 flex justify-center items-center md:px-3 p-2 border-2 rounded-md text-sm font-semibold',
            {
              'text-brand-blue dark:text-white bg-blue-100 border-blue-600 dark:bg-very-dark-blue':
                isPeopleSelected,
            },
            { 'text-brand-black dark:text-gray-50': !isPeopleSelected }
          )}
          onClick={() => {
            toggleMarket('Twitter')
          }}
        >
          <span className="w-5 mr-1">
            {twitterMarketSpecifics?.getMarketSVGTheme(resolvedTheme)}
          </span>
          <span>People</span>
        </button>
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

      <FiltersButton
        className="hidden md:flex text-sm whitespace-nowrap"
        onClick={setIsGhostOnlyActive}
        isSelected={isGhostOnlyActive}
        label={<GhostIconBlack className="w-6 h-6" />}
      />

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
