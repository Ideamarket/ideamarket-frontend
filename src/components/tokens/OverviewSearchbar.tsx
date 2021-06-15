import Search from '../../assets/search.svg'
import { SearchIcon } from '@heroicons/react/solid'

type Props = {
  onNameSearchChanged: (value: string) => void
}

export const OverviewSearchbar = ({ onNameSearchChanged }: Props) => {
  return (
    // The gridColumn makes search bar span 2 columns for mobile devices. TailwindCSS wouldn't work here for some reason
    <div className="w-full" style={{ gridColumn: 'span 2 / span 2' }}>
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
          className="block w-full h-full pl-10 border border-gray-200 dark:border-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-300 dark:bg-gray-600 dark:placeholder-gray-200"
          placeholder="Search"
          onChange={(event) => {
            onNameSearchChanged(
              event.target.value.length >= 2 ? event.target.value : ''
            )
          }}
        />
      </div>
    </div>
  )
}
