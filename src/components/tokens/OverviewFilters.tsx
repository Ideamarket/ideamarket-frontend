import { getMarketSpecificsByMarketName } from 'store/markets'
import React from 'react'
import { OverviewSearchbar } from './OverviewSearchbar'
import { toggleMarketHelper } from './utils/OverviewUtils'
// import { getIconVersion } from 'utils/icons'
import { useQuery } from 'react-query'
import OverviewFiltersMobile from 'components/home/OverviewFiltersMobile'
import SelectableButton from 'components/buttons/SelectableButton'
import getAllCategories from 'actions/web3/getAllCategories'
import { useContractStore } from 'store/contractStore'

type OverviewFiltersProps = {
  orderBy: string
  selectedMarkets: Set<string>
  selectedColumns: Set<string>
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isGhostOnlyActive: boolean
  selectedCategories: string[]
  setOrderBy: (value: string) => void
  onMarketChanged: (set: Set<string>) => void
  onColumnChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setIsGhostOnlyActive: (isActive: boolean) => void
  setSelectedCategories: (selectedCategories: string[]) => void
}

export const OverviewFilters = ({
  orderBy,
  selectedMarkets,
  selectedColumns,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isGhostOnlyActive,
  selectedCategories,
  setOrderBy,
  onMarketChanged,
  onColumnChanged,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setIsGhostOnlyActive,
  setSelectedCategories,
}: OverviewFiltersProps) => {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts

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
  }

  /**
   * This method is called when a category is clicked on home table.
   * @param newClickedCategory -- Category just clicked
   */
  const onCategoryClicked = (newClickedCategory: string) => {
    const isCatAlreadySelected =
      selectedCategories.includes(newClickedCategory)
    let newCategories = [...selectedCategories]
    if (isCatAlreadySelected) {
      newCategories = newCategories.filter(
        (cat) => cat !== newClickedCategory
      )
    } else {
      newCategories.push(newClickedCategory)
    }
    setSelectedCategories(newCategories)
  }

  const { data: categoriesData } = useQuery(["all-categories", Boolean(ideamarketPosts)], () =>
    getAllCategories()
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
                label={`#${cat}`}
                isSelected={selectedCategories.includes(cat)}
                onClick={() => onCategoryClicked(cat)}
                key={cat}
              />
            ))}
        </div>

        <div className="flex w-52 h-9 md:h-auto ml-auto">
          <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        </div>

        {/* <SelectableButton
          onClick={setIsVerifiedFilterActive}
          isSelected={isVerifiedFilterActive}
          label={getIconVersion(
            'verify',
            resolvedTheme,
            isVerifiedFilterActive
          )}
        /> */}

        {/* <DropdownButton
          filters={CheckboxFilters.COLUMNS.values}
          name={<AdjustmentsIcon className="w-5 h-5" />}
          selectedOptions={selectedColumns}
          toggleOption={toggleColumn}
          dropdownType="columns"
        /> */}
      </div>

      <OverviewFiltersMobile
        orderBy={orderBy}
        isVerifiedFilterActive={isVerifiedFilterActive}
        isStarredFilterActive={isStarredFilterActive}
        isGhostOnlyActive={isGhostOnlyActive}
        categoriesData={categoriesData}
        selectedCategories={selectedCategories}
        isURLSelected={isURLSelected}
        isPeopleSelected={isPeopleSelected}
        twitterMarketSpecifics={twitterMarketSpecifics}
        setOrderBy={setOrderBy}
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
