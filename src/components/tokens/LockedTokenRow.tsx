import { DateTime } from 'luxon'
import { LockedAmount } from 'store/ideaMarketsStore'

export default function LockedTokenRow({
  lockedAmount,
}: {
  lockedAmount: LockedAmount
}) {
  return (
    <div className="table-row cursor-pointer bg-brand-gray hover:bg-white">
      <div className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-auto h-auto">
            {DateTime.fromSeconds(
              Number(lockedAmount.lockedUntil)
            ).toLocaleString(DateTime.DATETIME_MED)}
          </div>
        </div>
      </div>
      <div className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-auto h-auto">{lockedAmount.amount}</div>
        </div>
      </div>
    </div>
  )
}
