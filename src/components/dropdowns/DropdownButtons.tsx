import classNames from 'classnames'
import {
  StarIcon,
  SparklesIcon,
  FireIcon,
  ArrowSmUpIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { useMixPanel } from 'utils/mixPanel'

const DropdownButtons = ({
  container,
  filters,
  selectedOptions,
  toggleOption,
}) => {
  const { mixpanel } = useMixPanel()

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

  return (
    // Needed wrapper div so hover-over container doesn't disappear when moving from button to container. Used random height, this can change if needed
    <div className="absolute top-full left-0 w-full h-36 z-50">
      <div
        ref={container}
        className="absolute flex flex-col w-full h-auto md:w-auto p-4 mt-1 bg-white border rounded-lg shadow-xl cursor-default dark:bg-gray-800"
        style={{ top: 0, left: 0, right: 0 }}
      >
        {filters.map((filter) => (
          <span className="my-1" key={filter.id}>
            <button
              className={classNames(
                'flex flex-grow md:flex-auto justify-start items-center w-full md:px-3 p-2 border md:rounded-md text-sm font-semibold',
                {
                  'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                    selectedOptions.has(filter.id),
                },
                {
                  'text-brand-black dark:text-gray-50': !selectedOptions.has(
                    filter.id
                  ),
                }
              )}
              onClick={() => {
                toggleOption(filter.id)
                mixpanel.track('FILTER_PLATFORM', { platforms: filters })
              }}
            >
              {getButtonIcon(filter.id)}
              <span>{filter.value}</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default DropdownButtons
