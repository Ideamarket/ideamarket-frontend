import moment from 'moment'

import { LockedAmount } from 'store/ideaMarketsStore'

export default function LockedTokenRow({
  lockedAmount,
}: {
  lockedAmount: LockedAmount
}) {
  return (
    <div className="table-row cursor-pointer bg-brand-gray dark:bg-gray-700  hover:bg-white">
      <div className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-auto h-auto">
            {moment(lockedAmount.lockedUntil * 1000).format('LLL')}
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
