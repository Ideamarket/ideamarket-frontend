import classNames from 'classnames'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { useTokenIconURL } from 'actions'
import ModalService from 'components/modals/ModalService'
import TradeModal from 'components/trade/TradeModal'
import { TX_TYPES } from 'components/trade/TradeCompleteModal'

export default function L1TokenTableRow({
  pair,
  balance,
  setSelectedPair,
}: {
  pair: any
  balance: string
  setSelectedPair: (pair: any) => void
}) {
  const { token, market } = pair
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })

  return (
    <>
      <tr
        className="grid border-b cursor-pointer md:grid-cols-3 grid-cols-mobile-row md:table-row hover:bg-brand-gray border-brand-border-gray"
        onClick={() => {
          setSelectedPair(pair)
        }}
      >
        {/* Market */}
        <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-gray-500 md:table-cell whitespace-nowrap">
          <div className="flex items-center justify-end w-full h-full">
            <div className="w-5 h-5 mr-2 md:mr-0">
              {marketSpecifics.getMarketSVGBlack()}
            </div>
          </div>
        </td>
        {/* Icon and Name */}
        <td className="flex py-4 pl-2 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap">
          <div className="flex items-center w-full">
            <div className={classNames('flex-shrink-0 w-7.5 h-7.5')}>
              {isTokenIconLoading ? (
                <div className="w-full h-full bg-gray-400 rounded-full animate-pulse"></div>
              ) : (
                <img
                  className="w-full h-full rounded-full"
                  src={tokenIconURL}
                  alt=""
                />
              )}
            </div>
            <div className="ml-4 text-base font-medium leading-5 text-gray-900 truncate hover:underline">
              <span>{token.name}</span>
            </div>
          </div>
        </td>
        {/* Balance */}
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            Balance
          </p>
          <p
            className="inline-block text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={balance}
          >
            {balance}
          </p>
          {pair?.lockedAmount && pair?.lockedAmount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                ModalService.open(TradeModal, {
                  ideaToken: token,
                  market,
                  startingTradeType: TX_TYPES.LOCK,
                })
              }}
              className="w-16 h-10 ml-4 text-base font-medium text-white border-2 rounded-lg bg-brand-blue dark:bg-gray-600 border-brand-blue dark:text-gray-300"
            >
              <span>Lock</span>
            </button>
          )}
        </td>
      </tr>
    </>
  )
}
