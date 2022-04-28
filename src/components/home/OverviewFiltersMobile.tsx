import { StarIcon, ChevronDownIcon } from '@heroicons/react/solid'
import {
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import useOnClickOutside from 'utils/useOnClickOutside'
import SelectableButton, {
  JOINED_TYPES,
} from 'components/buttons/SelectableButton'
// import { getIconVersion } from 'utils/icons'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import { IMarketSpecifics } from 'store/markets'
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import { useRef, useState } from 'react'
import {
  getSortOptionDisplayNameByValue,
  SortOptionsHomeTable,
  TABLE_NAMES,
} from 'utils/tables'

type Props = {
  orderBy: string
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isGhostOnlyActive: boolean
  categoriesData: any[]
  selectedCategories: string[]
  isURLSelected: boolean
  isPeopleSelected: boolean
  twitterMarketSpecifics: IMarketSpecifics
  setOrderBy: (value: string) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setIsGhostOnlyActive: (isActive: boolean) => void
  onCategoryClicked: (newClickedCategoryId: string) => void
  toggleMarket: (marketName: string) => void
}

const OverviewFiltersMobile = ({
  orderBy,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isGhostOnlyActive,
  categoriesData,
  selectedCategories,
  isURLSelected,
  isPeopleSelected,
  twitterMarketSpecifics,
  setOrderBy,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setIsGhostOnlyActive,
  onCategoryClicked,
  toggleMarket,
}: Props) => {
  const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false)
  const ref = useRef()
  useOnClickOutside(ref, () => setIsSortingDropdownOpen(false))

  /**
   * @param sortId -- id defined on frontend for sorting a certain way
   * @returns icon that is displayed for this specific sortId
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSortByIcon = (filterId: number) => {
    switch (filterId) {
      case 1:
        return <ArrowSmUpIcon className="w-4 h-4 stroke-current" />
      case 2:
        return <FireIcon className="w-4 h-4 mr-1" />
      case 3:
        return <SparklesIcon className="w-4 h-4 mr-1" />
      case 4:
        return <StarIcon className="w-4 h-4 mr-1" />
      default:
        return <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
    }
  }

  return (
    <div className="md:hidden bg-white dark:bg-gray-700 rounded-t-xl">
      <div className="p-3 border-b-4">
        <div className="flex justify-between space-x-2 w-full h-10 mb-2">
          <SelectableButton
            onClick={setIsStarredFilterActive}
            isSelected={isStarredFilterActive}
            label={<StarIcon className="w-5 h-5" />}
            joined={JOINED_TYPES.NONE}
            className="rounded-lg"
          />
          <div
            onClick={() => setIsSortingDropdownOpen(!isSortingDropdownOpen)}
            className="relative w-full flex justify-center items-center px-2 py-1 ml-auto border rounded-md"
          >
            <span className="mr-1 text-sm text-black/[.5] font-semibold dark:text-white whitespace-nowrap">
              Sort by:
            </span>
            <span className="text-sm text-blue-500 font-semibold flex items-center">
              {/* <span>{getSortByIcon(selectedSortOptionID)}</span> */}
              <span>
                {getSortOptionDisplayNameByValue(orderBy, TABLE_NAMES.HOME)}
              </span>
            </span>
            <span>
              <ChevronDownIcon className="h-5" />
            </span>

            {isSortingDropdownOpen && (
              <DropdownButtons
                container={ref}
                filters={Object.values(SortOptionsHomeTable)}
                selectedOptions={new Set([orderBy])}
                toggleOption={setOrderBy}
              />
            )}
          </div>
        </div>

        <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
      </div>

      <div className="p-3 flex items-center overflow-x-scroll">
        {/* <div className="flex items-center space-x-2 pr-2 border-r-2">
          <button
            className={classNames(
              'h-10 flex justify-center items-center md:px-3 p-2 rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-blue-100 dark:bg-very-dark-blue':
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
              'h-10 flex justify-center items-center md:px-3 p-2 rounded-md text-sm font-semibold',
              {
                'text-brand-blue dark:text-white bg-blue-100 dark:bg-very-dark-blue':
                  isPeopleSelected,
              },
              { 'text-brand-black dark:text-gray-50': !isPeopleSelected }
            )}
            onClick={() => {
              toggleMarket('Twitter')
            }}
          >
            <span className="w-5 mr-1">
              {twitterMarketSpecifics?.getMarketSVGTheme(
                resolvedTheme,
                isPeopleSelected
              )}
            </span>
            <span>Users</span>
          </button>
        </div> */}

        <div className="flex gap-x-2 pl-2">
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
      </div>
    </div>
  )
}

export default OverviewFiltersMobile
