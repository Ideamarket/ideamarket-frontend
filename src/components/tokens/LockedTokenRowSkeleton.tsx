export default function LockedTokenRowSkeleton() {
  return (
    <>
      <tr className="table-row cursor-pointer bg-brand-gray animate animate-pulse bg-brand-gray">
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-auto bg-white rounded">
              <div className="invisible">123</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-auto invisible bg-white rounded">
              <div className="invisible">123</div>
            </div>
          </div>
        </td>
      </tr>
    </>
  )
}
