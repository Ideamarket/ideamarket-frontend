import classNames from 'classnames'

export default function TokenRowSkeleton() {
  return (
    <>
      <tr className="grid grid-cols-mobile-row grid-flow-col md:table-row animate animate-pulse">
        <td className="hidden py-4 pl-3 pr-1 md:table-cell">
          <div className="w-8 h-5 bg-gray-400 rounded"></div>
        </td>
        <td className="flex md:table-cell md:col-span-3 py-4 pl-2 md:pl-6 whitespace-nowrap">
          <div className="flex items-center">
            <div
              className={classNames(
                'flex-shrink-0 w-7.5 h-7.5 rounded-full bg-gray-400'
              )}
            ></div>
            <div className="w-20 h-4 ml-4 bg-gray-400 rounded"></div>
          </div>
        </td>
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="h-4 w-8 bg-gray-400 rounded"></p>
        </td>
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="h-4 w-10 bg-gray-400 rounded"></p>
        </td>
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="flex md:table-cell items-center py-4 pl-4 md:pl-6 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
          <button className="h-10 bg-gray-400 rounded-lg w-24">
            <span className="invisible">Trade</span>
          </button>
        </td>
        <td className="md:hidden pl-4 py-4 whitespace-nowrap">
          <button className="px-2 py-1 rounded-lg bg-gray-400">
            <span className="invisible">$0.00</span>
          </button>
        </td>
        <td className="py-4 px-3 md:pl-3 md:pr-6 whitespace-nowrap">
          <div className="flex justify-center items-center h-full">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
          </div>
        </td>
      </tr>
    </>
  )
}
