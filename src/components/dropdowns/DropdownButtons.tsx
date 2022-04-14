import classNames from 'classnames'

const DropdownButtons = ({
  container,
  filters,
  selectedOptions, // Right now can only select one sort option. However, using this value allows us to change that and select multiple values at once if ever needed
  toggleOption,
}) => {
  return (
    // Needed wrapper div so hover-over container doesn't disappear when moving from button to container. Used random height, this can change if needed
    <div className="absolute top-full left-0 w-full h-36 z-50">
      <div
        ref={container}
        className="absolute flex flex-col w-full h-auto md:w-auto p-4 mt-1 bg-white border rounded-lg shadow-xl cursor-default dark:bg-gray-800"
        style={{ top: 0, left: 0, right: 0 }}
      >
        {filters.map((filter) => (
          <span className="my-1" key={filter.value}>
            <button
              className={classNames(
                'flex flex-grow md:flex-auto justify-start items-center w-full md:px-3 p-2 border md:rounded-md text-sm font-semibold',
                {
                  'text-brand-blue dark:text-white bg-gray-100 dark:bg-very-dark-blue':
                    selectedOptions.has(filter.value),
                },
                {
                  'text-brand-black dark:text-gray-50': !selectedOptions.has(
                    filter.value
                  ),
                }
              )}
              onClick={() => {
                toggleOption(filter.value)
              }}
            >
              <span>{filter.displayName}</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default DropdownButtons
