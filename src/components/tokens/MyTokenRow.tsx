import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/dist/client/router'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { calculateCurrentPriceBN, web3BNToFloatString } from 'utils'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export default function MyTokenRow({
  token,
  market,
  compoundSupplyRate,
}: {
  token: IdeaToken
  market: IdeaMarket
  compoundSupplyRate: number
}) {
  const router = useRouter()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)

  return (
    <>
      <tr
        className="grid grid-cols-3 cursor-pointer md:table-row hover:bg-brand-gray border-b border-brand-border-gray"
        onClick={() => {
          router.push(
            `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
              token.name
            )}`
          )
        }}
      >
        <td className="col-span-3 px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-7.5 h-7.5">
              <img
                className="w-full h-full rounded-full"
                src={marketSpecifics.getTokenIconURL(token.name)}
                alt=""
              />
            </div>
            <div className="ml-4 text-base font-semibold leading-5 text-gray-900">
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
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4">
            Market
          </p>
          <div className="flex items-center">
            <div className="w-full h-full md:w-auto md:h-auto">
              {marketSpecifics.getMarketSVGBlack()}
            </div>
            <div className="ml-1 md:ml-3">
              {marketSpecifics.getMarketName()}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4">
            Price
          </p>
          <p className="text-base font-semibold leading-4 tracking-tightest-2 text-very-dark-blue">
            $
            {web3BNToFloatString(
              calculateCurrentPriceBN(
                token.rawSupply,
                market.rawBaseCost,
                market.rawPriceRise,
                market.rawHatchTokens
              ),
              tenPow18,
              2
            )}
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4">
            24H Change
          </p>
          <p
            className={classNames(
              'text-base font-semibold leading-4 tracking-tightest-2 text-very-dark-blue',
              parseFloat(token.dayChange) >= 0.0
                ? 'text-brand-green'
                : 'text-brand-red'
            )}
          >
            {parseFloat(token.dayChange) >= 0.0
              ? `+ ${token.dayChange}`
              : `- ${token.dayChange.slice(1)}`}
            %
          </p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4">
            1YR Income
          </p>
          <p className="text-base font-semibold leading-4 tracking-tightest-2 text-very-dark-blue">
            ${(parseFloat(token.daiInToken) * compoundSupplyRate).toFixed(2)}
          </p>
        </td>
      </tr>
    </>
  )
}
