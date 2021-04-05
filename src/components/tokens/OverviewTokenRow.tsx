import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/dist/client/router'
import { WatchingStar } from 'components'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  calculateCurrentPriceBN,
  formatNumberWithCommasAsThousandsSerperator,
  formatNumber,
  web3BNToFloatString,
} from 'utils'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

type Props = {
  token: IdeaToken
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  onTradeClicked,
}: Props) {
  const router = useRouter()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)

  const yearIncome = (
    parseFloat(token.daiInToken) * compoundSupplyRate
  ).toFixed(2)

  const tokenPrice = web3BNToFloatString(
    calculateCurrentPriceBN(
      token.rawSupply,
      market.rawBaseCost,
      market.rawPriceRise,
      market.rawHatchTokens
    ),
    tenPow18,
    2
  )

  return (
    <>
      <tr
        className="grid grid-cols-mobile-row grid-flow-col cursor-pointer md:table-row hover:bg-brand-gray"
        onClick={() => {
          router.push(
            `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
              token.name
            )}`
          )
        }}
      >
        {/* Market */}
        <td className="flex justify-center items-center py-4 text-sm leading-5 text-center text-gray-500 md:table-cell whitespace-nowrap">
          <div className="flex justify-end items-center w-full h-full">
            <div className="w-5 h-5 mr-2 md:mr-0">
              {marketSpecifics.getMarketOutlineSVG()}
            </div>
          </div>
        </td>
        {/* Icon and Name */}
        <td className="flex md:table-cell md:col-span-3 py-4 pl-2 md:pl-6 whitespace-nowrap">
          <div className="w-full flex items-center">
            {showMarketSVG && marketSpecifics.getMarketOutlineSVG()}
            <div
              className={classNames(
                'flex-shrink-0 w-7.5 h-7.5',
                showMarketSVG && 'ml-2'
              )}
            >
              <img
                className="w-full h-full rounded-full"
                src={marketSpecifics.getTokenIconURL(token.name)}
                alt=""
              />
            </div>
            <div className="truncate hover:underline ml-4 text-base font-medium leading-5 text-gray-900">
              <span>{token.name}</span>
            </div>
          </div>
        </td>
        {/* Price */}
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            Price
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + tokenPrice}
          >
            ${formatNumber(tokenPrice)}
          </p>
        </td>
        {/* Deposits */}
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            Deposits
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + token.daiInToken}
          >
            {parseFloat(token.daiInToken) > 0.0 ? (
              `$` +
              formatNumberWithCommasAsThousandsSerperator(
                parseInt(token.daiInToken)
              )
            ) : (
              <>&mdash;</>
            )}
          </p>
        </td>
        {/* %Locked */}
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            % Locked
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={parseInt(token.lockedPercentage) + ' %'}
          >
            {parseFloat(token.lockedPercentage) * 100.0 > 0.0 ? (
              parseInt(token.lockedPercentage) + ' %'
            ) : (
              <>&mdash;</>
            )}
          </p>
        </td>
        {/* Year Income */}
        <td className="hidden md:table-cell py-4 pl-6 whitespace-nowrap">
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + yearIncome}
          >
            ${formatNumberWithCommasAsThousandsSerperator(parseInt(yearIncome))}
          </p>
        </td>
        {/* Buy Button */}
        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTradeClicked(token, market)
            }}
            className="md:table-cell w-24 h-10 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
          >
            Buy
          </button>
        </td>
        {/* Buy Button mobile */}
        <td className="md:hidden pl-4 py-4 whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTradeClicked(token, market)
            }}
            className="px-2 py-1 w-16 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
          >
            ${formatNumber(tokenPrice)}
          </button>
        </td>
        {/* Star */}
        <td className="py-4 px-3 md:pl-3 md:pr-6 text-sm leading-5 text-gray-500 whitespace-nowrap">
          <div className="flex items-center justify-center h-full">
            <WatchingStar token={token} />
          </div>
        </td>
      </tr>
    </>
  )
}
