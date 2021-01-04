import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/dist/client/router'
import { PreviewPriceChart, WatchingStar } from 'components'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  calculateCurrentPriceBN,
  formatNumber,
  web3BNToFloatString,
} from 'utils'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

function getChartData(token: IdeaToken) {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - 604800
  let beginPrice: number
  let endPrice: number
  if (token.weekPricePoints.length === 0) {
    beginPrice = token.latestPricePoint.price
    endPrice = token.latestPricePoint.price
  } else {
    beginPrice = token.weekPricePoints[0].oldPrice
    endPrice = token.weekPricePoints[token.weekPricePoints.length - 1].price
  }

  const chartData = [[weekBack, beginPrice]].concat(
    token.weekPricePoints.map((pricePoint) => [
      pricePoint.timestamp,
      pricePoint.price,
    ])
  )
  chartData.push([currentTs, endPrice])
  return chartData
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  onTradeClicked,
}: {
  token: IdeaToken
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}) {
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
        className="grid grid-cols-3 cursor-pointer md:table-row hover:bg-brand-gray max-w-100"
        onClick={() => {
          router.push(
            `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
              token.name
            )}`
          )
        }}
      >
        <td className="col-span-3 px-6 py-4">
          <div className="flex items-center">
            {showMarketSVG && marketSpecifics.getMarketSVGBlack()}
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
            <div className="ml-4 text-base font-medium leading-5 text-gray-900">
              <a
                href={`${marketSpecifics.getTokenURL(token.name)}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {token.name}
              </a>
            </div>
            <div className="flex items-center justify-center ml-auto md:hidden">
              <svg
                className="w-7.5 text-brand-blue"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
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
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            Deposits
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + token.daiInToken}
          >
            {parseFloat(token.daiInToken) > 0.0 ? (
              `$` + formatNumber(token.daiInToken)
            ) : (
              <>&mdash;</>
            )}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            % Locked
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={parseFloat(token.lockedPercentage).toFixed(2) + ' %'}
          >
            {parseFloat(token.lockedPercentage) * 100.0 > 0.0 ? (
              formatNumber(parseFloat(token.lockedPercentage).toFixed(2)) + ' %'
            ) : (
              <>&mdash;</>
            )}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            24H Change
          </p>
          <p
            className={classNames(
              'text-base font-medium leading-4 tracking-tightest-2 text-very-dark-blue uppercase',
              parseFloat(token.dayChange) >= 0.0
                ? 'text-brand-green'
                : 'text-brand-red'
            )}
            title={`${
              parseFloat(token.dayChange) >= 0.0
                ? `+ ${token.dayChange}`
                : `- ${token.dayChange.slice(1)}`
            }%`}
          >
            {parseFloat(token.dayChange) >= 0.0
              ? `+ ${formatNumber(token.dayChange)}`
              : `- ${formatNumber(token.dayChange.slice(1))}`}
            %
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            24H Volume
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + token.dayVolume}
          >
            ${formatNumber(token.dayVolume)}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4">
            1YR Income
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue"
            title={'$' + yearIncome}
          >
            ${formatNumber(yearIncome)}
          </p>
        </td>

        <td className="col-span-3 row-span-1 row-start-4 px-1 py-1 whitespace-nowrap col-start-0">
          <PreviewPriceChart chartData={getChartData(token)} />
        </td>
        <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTradeClicked(token, market)
            }}
            className="w-32 h-10 text-base font-medium bg-white border-2 rounded-lg border-brand-blue text-brand-blue hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
          >
            Trade
          </button>
        </td>
        <td className="px-6 py-4 text-sm leading-5 text-gray-500 whitespace-nowrap">
          <WatchingStar token={token} />
        </td>
      </tr>
    </>
  )
}
