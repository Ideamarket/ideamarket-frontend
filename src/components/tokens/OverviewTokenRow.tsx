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
  bigNumberTenPow18,
} from 'utils'
import { useTokenIconURL } from 'actions'
import {
  investmentTokenToUnderlying,
  queryExchangeRate,
} from 'store/compoundStore'
import { useQuery } from 'react-query'
import { BadgeCheckIcon, ArrowSmUpIcon } from '@heroicons/react/solid'
import useThemeMode from 'components/useThemeMode'
import Image from 'next/image'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

type Props = {
  token: IdeaToken
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  getColumn: (column: string) => any
  lastElementRef?: (node) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  getColumn,
  onTradeClicked,
  lastElementRef,
}: Props) {
  const router = useRouter()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
  const { resolvedTheme } = useThemeMode()

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

  const { data: compoundExchangeRate } = useQuery(
    'compound-exchange-rate',
    queryExchangeRate
  )

  const claimableIncome = web3BNToFloatString(
    investmentTokenToUnderlying(token.rawInvested, compoundExchangeRate).sub(
      token.rawDaiInToken
    ),
    bigNumberTenPow18,
    2
  )

  return (
    <tr
      ref={lastElementRef}
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
          <div className="w-5 h-auto mr-2 md:mr-0">
            {marketSpecifics.getMarketSVGTheme(resolvedTheme)}
          </div>
        </div>
      </td>
      {/* Icon and Name */}
      <td className="flex py-4 pl-2 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap">
        <div className="flex items-center w-full text-gray-900 dark:text-gray-200">
          {showMarketSVG && marketSpecifics.getMarketSVGTheme(resolvedTheme)}
          <div
            className={classNames(
              'flex-shrink-0 w-7.5 h-7.5',
              showMarketSVG && 'ml-2'
            )}
          >
            {isTokenIconLoading ? (
              <div className="w-full h-full bg-gray-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="relative w-full h-full rounded-full">
                <Image
                  src={tokenIconURL || '/gray.svg'}
                  alt="token"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-full"
                />
              </div>
            )}
          </div>
          <div className="ml-4 text-base font-medium leading-5 truncate hover:underline">
            <span>
              {token.name.substr(
                0,
                token.name.length > 25 ? 25 : token.name.length
              ) + (token.name.length > 25 ? '...' : '')}
            </span>
          </div>
          {/* Desktop Verified Badge */}
          {token.tokenOwner !== ZERO_ADDRESS && (
            <div className="hidden md:inline w-5 h-5 ml-1.5 text-black dark:text-white">
              <BadgeCheckIcon />
            </div>
          )}
        </div>
      </td>
      {/* Mobile Verified Badge */}
      <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-black md:hidden dark:text-white md:table-cell whitespace-nowrap">
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

      {/* 24H Change */}
      {getColumn('24H Change') && (
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className={classNames(
              'text-base font-medium leading-4 tracking-tightest-2 uppercase',
              parseFloat(token.dayChange) >= 0.0
                ? 'text-brand-green'
                : 'text-brand-red'
            )}
            title={`${
              parseFloat(token.dayChange) >= 0.0
                ? `+ ${parseInt(token.dayChange)}`
                : `- ${parseInt(token.dayChange.slice(1))}`
            }%`}
          >
            {parseFloat(token.dayChange) >= 0.0
              ? `+ ${parseInt(token.dayChange)}`
              : `- ${parseInt(token.dayChange.slice(1))}`}
            %
          </p>
        </td>
      )}

      {/* Deposits */}
      {getColumn('Deposits') && (
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
      )}

      {/* %Locked */}
      {getColumn('% Locked') && (
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
      )}

      {/* Year Income */}
      {getColumn('1YR Income') && (
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + yearIncome}
          >
            ${formatNumberWithCommasAsThousandsSerperator(parseInt(yearIncome))}
          </p>
        </td>
      )}

      {/* Claimable Income */}
      {getColumn('Claimable Income') ? (
        <td className="hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + claimableIncome}
          >
            $
            {formatNumberWithCommasAsThousandsSerperator(
              parseInt(claimableIncome)
            )}
          </p>
        </td>
      ) : (
        <></>
      )}

      {/* Buy Button */}
      <td className="hidden py-4 text-center md:table-cell whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTradeClicked(token, market)
          }}
          className="w-24 h-10 text-base font-medium text-white border-2 rounded-lg bg-brand-blue dark:bg-gray-600 md:table-cell border-brand-blue dark:text-gray-300 tracking-tightest-2 font-sf-compact-medium"
        >
          <div className="flex">
            <ArrowSmUpIcon className="w-6 h-6 ml-4" />
            <span>Buy</span>
          </div>
        </button>
      </td>
      {/* Buy Button mobile */}
      <td className="px-3 py-4 md:hidden whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTradeClicked(token, market)
          }}
          className="w-16 px-2 py-1 text-base font-medium bg-white border-2 rounded-lg dark:bg-gray-600 border-brand-blue text-brand-blue dark:text-gray-300 hover:text-white tracking-tightest-2 font-sf-compact-medium hover:bg-brand-blue"
        >
          ${formatNumber(tokenPrice)}
        </button>
      </td>

      {/* Star desktop */}
      <td className="hidden px-3 py-4 text-sm leading-5 text-gray-500 md:table-cell dark:text-gray-300 md:pl-3 md:pr-6 whitespace-nowrap">
        <div className="flex items-center justify-center h-full">
          <WatchingStar token={token} />
        </div>
      </td>
    </tr>
  )
}
