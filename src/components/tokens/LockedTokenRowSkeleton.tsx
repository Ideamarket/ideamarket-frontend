export default function LockedTokenRowSkeleton({ page }: { page: string }) {
  return (
    <>
      {page === 'account' ? (
        <tr className="grid grid-cols-3 md:table-row animate animate-pulse">
          <td className="col-span-3 px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-7.5 h-7.5 rounded-full bg-gray-400"></div>
              <div className="w-24 h-4 ml-4 bg-gray-400 rounded"></div>
              <div className="flex items-center justify-center ml-auto md:hidden">
                <div className="w-7.5 h-4 bg-gray-400 rounded"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
            <p className="h-4 mt-1 bg-gray-400 rounded"></p>
          </td>
        </tr>
      ) : (
        <div className="table-row cursor-pointer bg-brand-gray animate animate-pulse">
          <div className="px-6 py-3 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-10 h-auto bg-white rounded">
                <div className="invisible">123</div>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 whitespace-nowrap">
            <div className="flex items-center">
              <div className="invisible w-10 h-auto bg-white rounded">
                <div className="invisible">123</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
