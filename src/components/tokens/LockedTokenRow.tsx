import moment from 'moment'

import { LockedAmount } from 'store/ideaMarketsStore'

export default function MyTokenRow({
  lockedAmount,
}: {
  lockedAmount: LockedAmount
}) {
  return (
    <>
      <tr className="table-row cursor-pointer bg-brand-gray hover:bg-white">
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-auto h-auto">
              {moment(lockedAmount.lockedUntil * 1000).format('LLL')}
            </div>
          </div>
        </td>
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-auto h-auto">{lockedAmount.amount}</div>
          </div>
        </td>
      </tr>
    </>
  )
}
