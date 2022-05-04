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
import DropdownButtons from 'components/dropdowns/DropdownButtons'
import { useRef, useState } from 'react'
import {
  getSortOptionDisplayNameByValue,
  SortOptionsHomePostsTable,
  TABLE_NAMES,
} from 'utils/tables'
import Tooltip from 'components/tooltip/Tooltip'

type Props = {
  orderBy: string
  isStarredFilterActive: boolean
  categoriesData: any[]
  selectedCategories: string[]
  setOrderBy: (value: string) => void
  onNameSearchChanged: (value: string) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  onCategoryClicked: (newClickedCategoryId: string) => void
}

const OverviewFiltersMobile = ({
  orderBy,
  isStarredFilterActive,
  categoriesData,
  selectedCategories,
  setOrderBy,
  onNameSearchChanged,
  setIsStarredFilterActive,
  onCategoryClicked,
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
      <div className="p-3 border-b-[6px]">
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
                {getSortOptionDisplayNameByValue(
                  orderBy,
                  TABLE_NAMES.HOME_POSTS
                )}
              </span>
            </span>
            <span>
              <ChevronDownIcon className="h-5" />
            </span>

            {isSortingDropdownOpen && (
              <DropdownButtons
                container={ref}
                filters={Object.values(SortOptionsHomePostsTable)}
                selectedOptions={new Set([orderBy])}
                toggleOption={setOrderBy}
              />
            )}
          </div>
        </div>

        <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
      </div>

      <div className="flex gap-x-2 pl-2 py-3 overflow-x-scroll">
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

      <div className="w-full flex gap-x-3 px-3 py-3 border-t-[6px] leading-4 text-xs text-black/[.5] font-semibold">
        <div className="w-1/4 flex items-start">
          <span className="mr-1">
            MARKET
            <br />
            INTERST
          </span>
          <Tooltip>
            <div className="w-40 md:w-64">
              The total amount of IMO staked on all users who rated a post
            </div>
          </Tooltip>
        </div>

        <div className="w-1/4 flex items-start">
          <span className="mr-1">
            COMPOSITE
            <br />
            RATING
          </span>
          <Tooltip>
            <div className="w-40 md:w-64">
              Average rating, weighted by amount of IMO staked on each user (the
              more IMO staked on a user, the more their ratings impact Composite
              Rating). Ratings by users without staked IMO do not impact
              Composite Rating, but do impact Average Rating.
            </div>
          </Tooltip>
        </div>

        <div className="w-1/4">COMMENTS</div>

        <div className="w-1/4">RATE</div>
      </div>
    </div>
  )
}

export default OverviewFiltersMobile
