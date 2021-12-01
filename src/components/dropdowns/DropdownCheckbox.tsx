import classNames from 'classnames'
import { useMixPanel } from 'utils/mixPanel'

const DropdownCheckbox = ({
  container,
  filters,
  selectedOptions,
  toggleOption,
}) => {
  const { mixpanel } = useMixPanel()

  return (
    // Needed wrapper div so hover-over container doesn't disappear when moving from button to container. Used random height, this can change if needed
    <div className="absolute top-full left-0 w-full h-36">
      <div
        ref={container}
        className="absolute z-40 flex flex-col w-32 h-auto md:w-56 p-4 mt-1 bg-white border rounded-lg shadow-xl cursor-default dark:bg-gray-800"
        style={{ top: 0, left: 0 }}
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
    </div>
  )
}

export default DropdownCheckbox
