import classNames from 'classnames'
import { TOKENS_PER_PAGE } from './constants'

export default function TablePagination({
  currentPage,
  setCurrentPage,
  pairs,
}) {
  return (
    <div className="flex flex-row items-stretch justify-between px-10 py-5 md:justify-center md:flex md:space-x-10">
      <button
        onClick={() => {
          if (currentPage > 0) setCurrentPage(currentPage - 1)
        }}
        className={classNames(
          'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
          currentPage <= 0
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-brand-gray'
        )}
        disabled={currentPage <= 0}
      >
        &larr; Previous
      </button>
      <button
        onClick={() => {
          if (pairs && pairs.length === TOKENS_PER_PAGE)
            setCurrentPage(currentPage + 1)
        }}
        className={classNames(
          'px-4 py-2 text-sm font-medium leading-none cursor-pointer focus:outline-none font-sf-pro-text text-brand-gray-4 tracking-tightest',
          pairs?.length !== TOKENS_PER_PAGE
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-brand-gray'
        )}
        disabled={pairs?.length !== TOKENS_PER_PAGE}
      >
        Next &rarr;
      </button>
    </div>
  )
}
