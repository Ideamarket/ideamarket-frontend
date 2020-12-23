import { LockedAmount } from 'store/ideaMarketsStore'

export default function MyTokenRow({
  lockedAmount,
}: {
  lockedAmount: LockedAmount
}) {
  return (
    <>
      <tr className="table-row cursor-pointer hover:bg-brand-gray">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-auto h-auto">{lockedAmount.lockedUntil}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-auto h-auto">{lockedAmount.amount}</div>
          </div>
        </td>
      </tr>
    </>
  )
}
