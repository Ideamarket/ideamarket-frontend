import classNames from 'classnames'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { ChevronDownIcon, StarIcon } from '@heroicons/react/solid'
import {
  // AdjustmentsIcon,
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import React, { useEffect, useRef, useState } from 'react'
import { OverviewSearchbar } from './OverviewSearchbar'
import {
  // CheckboxFilters,
  SortOptions,
  // toggleColumnHelper,
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
import OverviewFiltersMobile from 'components/home/OverviewFiltersMobile'
import SelectableButton from 'components/buttons/SelectableButton'

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

  // const toggleColumn = (columnName: string) => {
  //   const newSet = toggleColumnHelper(columnName, selectedColumns)
  //   onColumnChanged(newSet)
  // }

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

  const { data: categoriesData } = useQuery([true], () =>
    getCategories({ enabled: true })
  )

  const isURLSelected = selectedMarkets.has('URL')
  const isPeopleSelected = selectedMarkets.has('Twitter')
  const twitterMarketSpecifics = getMarketSpecificsByMarketName('Twitter')

  return (
    <div>
      <div className="hidden md:flex md:justify-start justify-center h-28 md:h-16 p-3 bg-white rounded-t-lg dark:bg-gray-700 gap-x-2 gap-y-2">
        <div className="flex md:gap-x-2">
          {categoriesData &&
            categoriesData.map((cat: any) => (
              <SelectableButton
                label={`#${cat.name}`}
                isSelected={selectedCategories.includes(cat.id)}
                onClick={() => onCategoryClicked(cat.id)}
                key={cat.id}
              />
            ))}
        </div>

        <div className="flex w-full h-9 md:h-auto ml-auto">
          <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        </div>

        <DropdownButton
          filters={Object.values(SortOptions)}
          name={
            Object.values(SortOptions).find(
              (filter) => filter.id === selectedFilterId
            )?.value
          }
          selectedOptions={new Set([selectedFilterId])}
          toggleOption={onFilterChanged}
          dropdownType="buttons"
          selectedFilterId={selectedFilterId}
        />

        <SelectableButton
          onClick={setIsVerifiedFilterActive}
          isSelected={isVerifiedFilterActive}
          label={getIconVersion(
            'verify',
            resolvedTheme,
            isVerifiedFilterActive
          )}
        />

        <SelectableButton
          onClick={setIsStarredFilterActive}
          isSelected={isStarredFilterActive}
          label={<StarIcon className="w-5 h-5" />}
        />

        <SelectableButton
          className="text-sm whitespace-nowrap"
          onClick={setIsGhostOnlyActive}
          isSelected={isGhostOnlyActive}
          label={
            <GhostIconBlack
              className={classNames(
                isGhostOnlyActive && 'stroke-blue-500',
                'w-6 h-6'
              )}
            />
          }
        />

        {/* <DropdownButton
          filters={CheckboxFilters.COLUMNS.values}
          name={<AdjustmentsIcon className="w-5 h-5" />}
          selectedOptions={selectedColumns}
          toggleOption={toggleColumn}
          dropdownType="columns"
        /> */}
      </div>

      <OverviewFiltersMobile
        selectedSortOptionID={selectedFilterId}
        isVerifiedFilterActive={isVerifiedFilterActive}
        isStarredFilterActive={isStarredFilterActive}
        isGhostOnlyActive={isGhostOnlyActive}
        categoriesData={categoriesData}
        selectedCategories={selectedCategories}
        isURLSelected={isURLSelected}
        isPeopleSelected={isPeopleSelected}
        twitterMarketSpecifics={twitterMarketSpecifics}
        toggleSortOption={onFilterChanged}
        onNameSearchChanged={onNameSearchChanged}
        setIsVerifiedFilterActive={setIsVerifiedFilterActive}
        setIsStarredFilterActive={setIsStarredFilterActive}
        setIsGhostOnlyActive={setIsGhostOnlyActive}
        onCategoryClicked={onCategoryClicked}
        toggleMarket={toggleMarket}
      />
    </div>
  )
}
