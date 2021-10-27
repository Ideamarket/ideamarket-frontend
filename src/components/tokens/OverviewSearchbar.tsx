import { SearchIcon } from '@heroicons/react/solid'
import { debounce } from 'utils/lodash'

type Props = {
  onNameSearchChanged: (value: string) => void
}

export const OverviewSearchbar = ({ onNameSearchChanged }: Props) => {
  const handleOnSearch = debounce(
    ({ target }) =>
      onNameSearchChanged(target.value.length >= 2 ? target.value : ''),
    500
  )

  return (
    <div className="w-full h-full">
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <div className="relative h-full max-w-xs ml-auto">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="w-5 h-5 dark:text-white" />
        </div>
        <input
          type="text"
          id="search-input"
          className="block w-full h-full pl-10 border border-gray-200 rounded-md dark:border-gray-500 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200"
          placeholder="Search"
          onChange={handleOnSearch}
        />
      </div>
    </div>
  )
}
