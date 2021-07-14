import classNames from 'classnames'

export default function TokenRowSkeleton({
  getColumn,
}: {
  getColumn: (column: string) => any
}) {
  return (
    <>
      <tr className="grid grid-flow-col grid-cols-mobile-row md:table-row animate animate-pulse">
        {/* Rank */}
        <td className="hidden py-4 pl-3 pr-1 md:table-cell">
          <div className="w-8 h-5 bg-gray-400 rounded"></div>
        </td>
        {/* Market */}
        <td className="table-cell py-4 pl-3 pr-1">
          <div className="w-8 h-5 bg-gray-400 rounded"></div>
        </td>
        {/* Icon and Name */}
        <td className="flex py-4 pl-2 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap">
          <div className="flex items-center">
            <div
              className={classNames(
                'flex-shrink-0 w-7.5 h-7.5 rounded-full bg-gray-400'
              )}
            ></div>
            <div className="w-20 h-4 ml-4 bg-gray-400 rounded"></div>
          </div>
        </td>
        {/* Price */}
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p className="w-8 h-4 bg-gray-400 rounded"></p>
        </td>
        {/* 24H Change */}
        {getColumn('24H Change') && (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
        )}
        {/* Deposits */}
        {getColumn('Deposits') && (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded"></p>
          </td>
        )}
        {/* %Locked */}
        {getColumn('% Locked') && (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
        )}
        {/* Year Income */}
        {getColumn('1YR Income') && (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
        )}
        {/* Buy Button */}
        <td className="hidden px-6 py-4 md:table-cell whitespace-nowrap">
          <button className="w-24 h-10 bg-gray-400 rounded-lg">
            <span className="invisible">Trade</span>
          </button>
        </td>
        {/* Buy Button mobile */}
        <td className="py-4 pl-4 md:hidden whitespace-nowrap">
          <button className="px-2 py-1 bg-gray-400 rounded-lg">
            <span className="invisible">$0.00</span>
          </button>
        </td>

        {/* Claimable Income */}
        {getColumn('Claimable Income') ? (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
        ) : (
          <></>
        )}

        {/* Star */}
        <td className="px-3 py-4 md:pl-3 md:pr-6 whitespace-nowrap">
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
          </div>
        </td>
      </tr>
    </>
  )
}
