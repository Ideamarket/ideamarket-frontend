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
  ZERO_ADDRESS,
} from 'utils'
import { useTokenIconURL } from 'actions'
import { BadgeCheckIcon } from '@heroicons/react/solid'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

type Props = {
  token: IdeaToken
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  getColumn: (column: string) => any
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  getColumn,
  onTradeClicked,
}: Props) {
  const router = useRouter()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })

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
        className="grid grid-flow-col cursor-pointer grid-cols-mobile-row md:table-row hover:bg-brand-gray dark:hover:bg-gray-600"
        onClick={() => {
          router.push(
            `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
              token.name
            )}`
          )
        }}
      >
        {/* Rank */}
        <td className="hidden py-4 pl-3 pr-1 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 md:table-cell whitespace-nowrap">
          {token.rank}
        </td>
        {/* Market */}
        <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 md:table-cell whitespace-nowrap">
          <div className="flex items-center justify-end w-full h-full">
            <div className="w-5 h-5 mr-2 md:mr-0">
              {marketSpecifics.getMarketSVGTheme()}
            </div>
          </div>
        </td>
        {/* Icon and Name */}
        <td className="flex py-4 pl-2 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap">
          <div className="flex items-center w-full text-gray-900 dark:text-gray-200">
            {showMarketSVG && marketSpecifics.getMarketOutlineSVG()}
            <div
              className={classNames(
                'flex-shrink-0 w-7.5 h-7.5',
                showMarketSVG && 'ml-2'
              )}
            >
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
            <div className="ml-4 text-base font-medium leading-5 truncate hover:underline">
              <span>{token.name}</span>
            </div>
            {/* Desktop Verified Badge */}
            {token.tokenOwner !== ZERO_ADDRESS && (
              <div className="hidden md:inline w-5 h-5 ml-1.5">
                <BadgeCheckIcon />
              </div>
            )}
          </div>
        </td>
        {/* Mobile Verified Badge */}
        <td className="md:hidden flex items-center justify-center py-4 text-sm leading-5 text-center text-gray-900 dark:text-gray-300 md:table-cell whitespace-nowrap">
          <div className="flex items-center justify-end h-full">
            <div className="w-5 h-5">
              {token.tokenOwner !== ZERO_ADDRESS && <BadgeCheckIcon />}
            </div>
          </div>
        </td>
        {/* Price */}
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
            Price
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + tokenPrice}
          >
            ${formatNumber(tokenPrice)}
          </p>
        </td>
        {/* Deposits */}
        {getColumn('Deposits') ? (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
              Deposits
            </p>
            <p
              className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
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
        ) : (
          <></>
        )}
        {/* %Locked */}
        {getColumn('% Locked') ? (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
              % Locked
            </p>
            <p
              className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
              title={parseInt(token.lockedPercentage) + ' %'}
            >
              {parseFloat(token.lockedPercentage) * 100.0 > 0.0 ? (
                parseInt(token.lockedPercentage) + ' %'
              ) : (
                <>&mdash;</>
              )}
            </p>
          </td>
        ) : (
          <></>
        )}

        {/* Year Income */}
        {getColumn('1YR Income') ? (
          <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
            <p
              className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
              title={'$' + yearIncome}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                parseInt(yearIncome)
              )}
            </p>
          </td>
        ) : (
          <></>
        )}

        {/* Buy Button */}
        <td className="hidden px-6 py-4 md:table-cell whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTradeClicked(token, market)
            }}
            className="w-24 h-10 text-base font-medium bg-white dark:bg-gray-600 border-2 rounded-lg md:table-cell border-brand-blue text-brand-blue dark:text-gray-300 hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
          >
            Buy
          </button>
        </td>
        {/* Buy Button mobile */}
        <td className="py-4 px-3 md:hidden whitespace-nowrap">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTradeClicked(token, market)
            }}
            className="w-16 px-2 py-1 text-base font-medium bg-white dark:bg-gray-600 border-2 rounded-lg border-brand-blue text-brand-blue dark:text-gray-300 hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
          >
            ${formatNumber(tokenPrice)}
          </button>
        </td>
        {/* Star desktop */}
        <td className="hidden md:table-cell px-3 py-4 text-sm leading-5 text-gray-500 dark:text-gray-300 md:pl-3 md:pr-6 whitespace-nowrap">
          <div className="flex items-center justify-center h-full">
            <WatchingStar token={token} />
          </div>
        </td>
      </tr>
    </>
  )
}
