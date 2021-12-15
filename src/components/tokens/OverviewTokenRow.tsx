import classNames from 'classnames'
import { useRouter } from 'next/dist/client/router'
import { A, WatchingStar } from 'components'
import { NETWORK } from 'store/networks'
import { queryDaiBalance } from 'store/daiStore'
import {
  queryInterestManagerTotalShares,
  IdeaMarket,
  IdeaToken,
} from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  calculateCurrentPriceBN,
  formatNumberWithCommasAsThousandsSerperator,
  formatNumber,
  web3BNToFloatString,
  ZERO_ADDRESS,
  bigNumberTenPow18,
  bnToFloatString,
} from 'utils'
import { useTokenIconURL } from 'actions'
import { useQuery } from 'react-query'
import { ArrowSmUpIcon } from '@heroicons/react/solid'
import useThemeMode from 'components/useThemeMode'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { useMixPanel } from 'utils/mixPanel'

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
  const { mixpanel } = useMixPanel()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const displayName = marketSpecifics.getTokenDisplayName(token.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
  const { resolvedTheme } = useThemeMode()

  const yearIncome = (parseFloat(token.marketCap) * compoundSupplyRate).toFixed(
    2
  )

  const tokenPrice = web3BNToFloatString(
    calculateCurrentPriceBN(
      token.rawSupply,
      market.rawBaseCost,
      market.rawPriceRise,
      market.rawHatchTokens
    ),
    bigNumberTenPow18,
    2
  )

  const { data: interestManagerTotalShares } = useQuery(
    'interest-manager-total-shares',
    queryInterestManagerTotalShares
  )

  const interestManagerAddress =
    NETWORK.getDeployedAddresses().interestManagerAVM
  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance', interestManagerAddress],
    queryDaiBalance
  )

  const claimableIncome =
    interestManagerTotalShares && interestManagerDaiBalance
      ? bnToFloatString(
          new BigNumber(token.rawInvested.toString())
            .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
            .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
            .minus(new BigNumber(token.rawMarketCap.toString())),
          bigNumberTenPow18,
          2
        )
      : '0'

  // This makes it so each row can be right clicked in order to open listing in new tab
  const pageLink = (
    <A
      href={`/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
        token.name
      )}`}
      className="absolute top-0 left-0 w-full h-full"
    />
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

        mixpanel.track('VIEW_LISTING', {
          market: marketSpecifics.getMarketNameURLRepresentation(),
          tokenName: marketSpecifics.getTokenNameURLRepresentation(token.name),
        })
      }}
    >
      {/* Rank */}
      <td className="relative hidden  py-4 pl-3 pr-1 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 md:table-cell whitespace-nowrap">
        {token.rank}
        {pageLink}
      </td>
      {/* Market */}
      <td className="relative flex items-center justify-center py-4 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 md:table-cell whitespace-nowrap">
        <div className="flex items-center justify-end w-full h-full">
          <div className="w-5 h-auto mr-2 md:mr-0">
            {marketSpecifics.getMarketSVGTheme(resolvedTheme)}
          </div>
        </div>
        {pageLink}
      </td>
      {/* Icon and Name */}
      <td className="relative flex py-4 pl-2 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap">
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
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
            )}
          </div>
          <div className="ml-4 text-base font-medium leading-5 truncate hover:underline">
            <span>
              {displayName.substr(
                0,
                displayName.length > 25 ? 25 : displayName.length
              ) + (displayName.length > 25 ? '...' : '')}
            </span>
          </div>
          {/* Desktop Verified Badge */}
          {token.tokenOwner !== ZERO_ADDRESS && (
            <div className="hidden md:inline w-5 h-5 ml-1.5 text-black dark:text-white">
              <IdeaverifyIconBlue className="w-full h-full" />
            </div>
          )}
        </div>
        {pageLink}
      </td>
      {/* Mobile Verified Badge */}
      <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-black md:hidden dark:text-white md:table-cell whitespace-nowrap">
        <div className="flex items-center justify-end h-full">
          <div className="w-5 h-5">
            {token.tokenOwner !== ZERO_ADDRESS && (
              <IdeaverifyIconBlue className="w-full h-full" />
            )}
          </div>
        </div>
      </td>
      {/* Price */}
      <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
        <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
          Price
        </p>
        <p
          className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
          title={'$' + tokenPrice}
        >
          ${formatNumber(tokenPrice)}
        </p>
        {pageLink}
      </td>
      {/* 24H Change */}
      {getColumn('24H Change') && (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
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
          {pageLink}
        </td>
      )}
      {/* 7D Change */}
      {getColumn('7D Change') && (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className={classNames(
              'text-base font-medium leading-4 tracking-tightest-2 uppercase',
              parseFloat(token.weeklyChange) >= 0.0
                ? 'text-brand-green'
                : 'text-brand-red'
            )}
            title={`${
              parseFloat(token.weeklyChange) >= 0.0
                ? `+ ${parseInt(token.weeklyChange)}`
                : `- ${parseInt(token.weeklyChange.slice(1))}`
            }%`}
          >
            {parseFloat(token.weeklyChange) >= 0.0
              ? `+ ${parseInt(token.weeklyChange)}`
              : `- ${parseInt(token.weeklyChange.slice(1))}`}
            %
          </p>
          {pageLink}
        </td>
      )}
      {/* Deposits */}
      {getColumn('Deposits') && (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
            Deposits
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + token.marketCap}
          >
            {parseFloat(token.marketCap) > 0.0 ? (
              `$` +
              formatNumberWithCommasAsThousandsSerperator(
                parseInt(token.marketCap)
              )
            ) : (
              <>&mdash;</>
            )}
          </p>
          {pageLink}
        </td>
      )}
      {/* %Locked */}
      {getColumn('% Locked') && (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
            % Locked
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={parseFloat(token.lockedPercentage) + ' %'}
          >
            {parseFloat(token.lockedPercentage) * 100.0 > 0.0 ? (
              Math.ceil(parseFloat(token.lockedPercentage)) + ' %'
            ) : (
              <>&mdash;</>
            )}
          </p>
          {pageLink}
        </td>
      )}
      {/* Year Income */}
      {getColumn('1YR Income') && (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + yearIncome}
          >
            ${formatNumberWithCommasAsThousandsSerperator(parseInt(yearIncome))}
          </p>
          {pageLink}
        </td>
      )}
      {/* Claimable Income */}
      {getColumn('Claimable Income') ? (
        <td className="relative hidden py-4 pl-6 md:table-cell whitespace-nowrap">
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + claimableIncome}
          >
            $
            {formatNumberWithCommasAsThousandsSerperator(
              parseInt(claimableIncome)
            )}
          </p>
          {pageLink}
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
            mixpanel.track('BUY_START', {
              tokenName: token.name,
            })
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
