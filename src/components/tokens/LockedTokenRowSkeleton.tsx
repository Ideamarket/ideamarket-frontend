export default function LockedTokenRowSkeleton() {
  return (
    <>
      <tr className="grid grid-cols-3 md:table-row animate animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="w-10 h-4 bg-gray-400 rounded md:hidden"></p>
          <p className="h-4 mt-1 bg-gray-400 rounded"></p>
        </td>
      </tr>
    </>
  )
}
