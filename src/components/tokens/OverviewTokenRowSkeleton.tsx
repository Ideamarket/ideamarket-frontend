import classNames from 'classnames'

export default function TokenRowSkeleton({
  showMarketSVG,
}: {
  showMarketSVG: boolean
}) {
  return (
    <>
      <tr className="grid grid-cols-3 md:table-row animate animate-pulse">
        <td className="col-span-3 px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {showMarketSVG && <div className="w-4 h-4 bg-gray-400"></div>}
            <div
              className={classNames(
                'flex-shrink-0 w-7.5 h-7.5 rounded-full bg-gray-400',
                showMarketSVG && 'ml-2.5'
              )}
            ></div>
            <div className="w-20 h-4 ml-4 bg-gray-400 rounded"></div>
            <div className="flex items-center justify-center ml-auto md:hidden">
              <div className="w-7.5 h-4 bg-gray-400 rounded"></div>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>

        <td className="col-span-3 row-span-1 row-start-4 px-6 py-4 text-sm leading-5 text-gray-500 whitespace-nowrap col-start-0">
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="hidden px-5 py-4 whitespace-nowrap md:table-cell">
          <button className="h-10 bg-gray-400 rounded-lg w-28">
            <span className="invisible">Trade</span>
          </button>
        </td>
        <td className="hidden px-5 py-4 whitespace-nowrap md:table-cell">
          <button className="h-10 bg-gray-400 rounded-lg w-28">
            <span className="invisible">Trade</span>
          </button>
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="w-5 h-5 bg-gray-400 rounded"></div>
        </td>
      </tr>
    </>
  )
}
