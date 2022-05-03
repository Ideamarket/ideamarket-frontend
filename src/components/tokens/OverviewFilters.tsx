import React from 'react'
import { OverviewSearchbar } from './OverviewSearchbar'
// import { getIconVersion } from 'utils/icons'
import { useQuery } from 'react-query'
import OverviewFiltersMobile from 'components/home/OverviewFiltersMobile'
import SelectableButton from 'components/buttons/SelectableButton'
import getAllCategories from 'actions/web3/getAllCategories'
import { useContractStore } from 'store/contractStore'

type OverviewFiltersProps = {
  orderBy: string
  selectedColumns: Set<string>
  isStarredFilterActive: boolean
  selectedCategories: string[]
  setOrderBy: (value: string) => void
  onColumnChanged: (set: Set<string>) => void
  onNameSearchChanged: (value: string) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setSelectedCategories: (selectedCategories: string[]) => void
}

export const OverviewFilters = ({
  orderBy,
  selectedColumns,
  isStarredFilterActive,
  selectedCategories,
  setOrderBy,
  onColumnChanged,
  onNameSearchChanged,
  setIsStarredFilterActive,
  setSelectedCategories,
}: OverviewFiltersProps) => {
  const ideamarketPosts = useContractStore.getState().ideamarketPosts

  /**
   * This method is called when a category is clicked on home table.
   * @param newClickedCategory -- Category just clicked
   */
  const onCategoryClicked = (newClickedCategory: string) => {
    const isCatAlreadySelected = selectedCategories.includes(newClickedCategory)
    let newCategories = [...selectedCategories]
    if (isCatAlreadySelected) {
      newCategories = newCategories.filter((cat) => cat !== newClickedCategory)
    } else {
      newCategories.push(newClickedCategory)
    }
    setSelectedCategories(newCategories)
  }

  const { data: categoriesData } = useQuery(
    ['all-categories', Boolean(ideamarketPosts)],
    () => getAllCategories()
  )

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
                roundedSize="3xl"
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
        isStarredFilterActive={isStarredFilterActive}
        categoriesData={categoriesData}
        selectedCategories={selectedCategories}
        setOrderBy={setOrderBy}
        onNameSearchChanged={onNameSearchChanged}
        setIsStarredFilterActive={setIsStarredFilterActive}
        onCategoryClicked={onCategoryClicked}
      />
    </div>
  )
}
