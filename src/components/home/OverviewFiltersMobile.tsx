import { StarIcon } from '@heroicons/react/solid'
import {
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
  GlobeAltIcon,
} from '@heroicons/react/outline'
// import useOnClickOutside from 'utils/useOnClickOutside'
import classNames from 'classnames'
import SelectableButton, {
  JOINED_TYPES,
} from 'components/buttons/SelectableButton'
// import { getIconVersion } from 'utils/icons'
import useThemeMode from 'components/useThemeMode'
import { OverviewSearchbar } from 'components/tokens/OverviewSearchbar'
import { IMarketSpecifics } from 'store/markets'

type Props = {
  selectedSortOptionID: number
  isVerifiedFilterActive: boolean
  isStarredFilterActive: boolean
  isGhostOnlyActive: boolean
  categoriesData: any[]
  selectedCategories: string[]
  isURLSelected: boolean
  isPeopleSelected: boolean
  twitterMarketSpecifics: IMarketSpecifics
  toggleSortOption: (sortOptionID: number) => void
  onNameSearchChanged: (value: string) => void
  setIsVerifiedFilterActive: (isActive: boolean) => void
  setIsStarredFilterActive: (isActive: boolean) => void
  setIsGhostOnlyActive: (isActive: boolean) => void
  onCategoryClicked: (newClickedCategoryId: string) => void
  toggleMarket: (marketName: string) => void
}

const OverviewFiltersMobile = ({
  selectedSortOptionID,
  isVerifiedFilterActive,
  isStarredFilterActive,
  isGhostOnlyActive,
  categoriesData,
  selectedCategories,
  isURLSelected,
  isPeopleSelected,
  twitterMarketSpecifics,
  toggleSortOption,
  onNameSearchChanged,
  setIsVerifiedFilterActive,
  setIsStarredFilterActive,
  setIsGhostOnlyActive,
  onCategoryClicked,
  toggleMarket,
}: Props) => {
  const { resolvedTheme } = useThemeMode()
  // const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false)
  // const ref = useRef()
  // useOnClickOutside(ref, () => setIsSortingDropdownOpen(false))

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
        <div className="flex">
          {/* <div
            onClick={() => setIsSortingDropdownOpen(!isSortingDropdownOpen)}
            className="relative w-max flex items-center px-2 py-1 border rounded-l-md"
          >
            <span className="mr-1 text-sm text-black/[.5] font-semibold dark:text-white whitespace-nowrap">
              Sort by:
            </span>
            <span className="text-sm text-blue-500 font-semibold flex items-center">
              <span>{getSortByIcon(selectedSortOptionID)}</span>
              <span>{getSortOptionDisplayNameByID(selectedSortOptionID)}</span>
            </span>
            <span>
              <ChevronDownIcon className="h-5" />
            </span>

            {isSortingDropdownOpen && (
              <DropdownButtons
                container={ref}
                filters={Object.values(SortOptions)}
                selectedOptions={new Set([selectedSortOptionID])}
                toggleOption={toggleSortOption}
              />
            )}
          </div> */}

          {/* <SelectableButton
            onClick={setIsVerifiedFilterActive}
            isSelected={isVerifiedFilterActive}
            label={getIconVersion(
              'verify',
              resolvedTheme,
              isVerifiedFilterActive
            )}
            joined={JOINED_TYPES.NONE}
            className="flex-grow" // Makes width grow to fit space
          /> */}

          <SelectableButton
            onClick={setIsStarredFilterActive}
            isSelected={isStarredFilterActive}
            label={<StarIcon className="w-5 h-5" />}
            joined={JOINED_TYPES.NONE}
            className="flex-grow"
          />
        </div>

        <div className="w-full h-9 mt-3">
          <OverviewSearchbar onNameSearchChanged={onNameSearchChanged} />
        </div>
      </div>

      <div className="p-3 flex items-center overflow-x-scroll">
        <div className="flex items-center space-x-2 pr-2 border-r-2">
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
        </div>

        <div className="flex gap-x-2 pl-2">
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
      </div>
    </div>
  )
}

export default OverviewFiltersMobile
