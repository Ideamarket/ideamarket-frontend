import classNames from 'classnames'
import BN from 'bn.js'
import { useRouter } from 'next/dist/client/router'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  calculateCurrentPriceBN,
  bigNumberTenPow18,
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  calculateIdeaTokenDaiValue,
  ZERO_ADDRESS,
} from 'utils'
import { A } from 'components'
import { useTokenIconURL } from 'actions'
import ModalService from 'components/modals/ModalService'
import LockModal from 'components/trade/LockModal'
import useThemeMode from 'components/useThemeMode'
import Image from 'next/image'
import GiftModal from 'components/trade/GiftModal'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { LockClosedIcon } from '@heroicons/react/solid'

export default function OwnedTokenRow({
  token,
  market,
  balance,
  balanceBN,
  lockedAmount,
  isL1,
  refetch,
  lastElementRef,
  userData,
}: {
  token: IdeaToken
  market: IdeaMarket
  balance: string
  balanceBN: BN
  lockedAmount: number
  isL1: boolean
  refetch: () => void
  lastElementRef?: (node) => void
  userData: any
}) {
  const router = useRouter()
  const ethAddresses = userData?.ethAddresses
  const isMultipleAddresses = ethAddresses && ethAddresses.length > 1
  const addressNumber = isMultipleAddresses
    ? ethAddresses.findIndex(
        (addressObj) => addressObj.address === token.holder
      ) + 1
    : null
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: token.name,
  })
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
  const { resolvedTheme } = useThemeMode()

  const balanceValueBN = calculateIdeaTokenDaiValue(
    token?.rawSupply,
    market,
    balanceBN
  )
  const balanceValue = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(balanceValueBN, bigNumberTenPow18, 2)
  )

  return (
    <tr
      ref={lastElementRef}
      className="grid grid-cols-3 border-b cursor-pointer md:table-row hover:bg-brand-gray border-brand-border-gray dark:hover:bg-gray-600 dark:border-gray-500 text-black"
      onClick={() => {
        router.push(
          `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
            token.name
          )}`
        )
      }}
    >
      {/* Market desktop */}
      <td className="flex items-center justify-center hidden py-4 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 md:table-cell whitespace-nowrap">
        <div className="flex items-center justify-end w-full h-full">
          {isMultipleAddresses && (
            <div className="relative w-5 h-5 ml-1">
              <Image
                src={`/${addressNumber}Emoji.png`}
                alt="address-number"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          <div className="w-5 h-auto ml-3">
            {marketSpecifics.getMarketSVGTheme(resolvedTheme)}
          </div>
        </div>
      </td>
      <td className="col-span-3 px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-gray-900 dark:text-gray-200">
          <div className="flex-shrink-0 w-7.5 h-7.5">
            {isTokenIconLoading ? (
              <div className="w-full h-full bg-gray-400 rounded-full dark:bg-gray-600 animate-pulse"></div>
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
          <div className="flex ml-4 text-base font-semibold leading-5">
            <A
              href={`${marketSpecifics.getTokenURL(token.name)}`}
              className="hover:underline"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {marketSpecifics.getTokenDisplayName(token.name)}
            </A>
            {isL1 && (
              <div className="ml-2 text-xs py-0.5 px-2.5 text-gray-400 border border-gray-400 rounded">
                L1
              </div>
            )}
          </div>
          {/* Verified Badge */}
          {token.tokenOwner !== ZERO_ADDRESS && (
            <div className="w-5 h-5 ml-1.5">
              <IdeaverifyIconBlue className="w-full h-full" />
            </div>
          )}
          <div className="flex items-center justify-center ml-auto md:hidden">
            <svg
              className="w-7.5 text-brand-blue dark:text-blue-500"
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
      {/* Market mobile */}
      <td className="px-6 py-4 whitespace-nowrap md:hidden">
        <p className="text-sm font-semibold tracking-tightest text-brand-gray-4 dark:text-gray-400">
          Market
        </p>
        <div className="inline-block w-4 h-4">
          {marketSpecifics.getMarketSVGTheme(resolvedTheme)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
          Price
        </p>
        <p
          className="text-base leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
          title={'$' + tokenPrice}
        >
          $
          {formatNumberWithCommasAsThousandsSerperator(
            parseFloat(tokenPrice).toFixed(2)
          )}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
          Balance
        </p>
        <p
          className="text-base leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
          title={balance}
        >
          {formatNumberWithCommasAsThousandsSerperator(
            parseFloat(balance).toFixed(2)
          )}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
          Value
        </p>
        <p
          className="text-base leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
          title={'$' + balanceValue}
        >
          ${balanceValue}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
          24H Change
        </p>
        <p
          className={classNames(
            'text-base leading-4 tracking-tightest-2 uppercase',
            {
              'text-brand-red dark:text-red-400':
                parseFloat(token.dayChange) < 0.0,
              'text-brand-green dark:text-green-400':
                parseFloat(token.dayChange) > 0.0,
              'text-very-dark-blue dark:text-gray-300':
                parseFloat(token.dayChange) === 0.0,
            }
          )}
          title={
            parseFloat(token.dayChange) >= 0.0
              ? `+ ${token.dayChange}%`
              : `- ${token.dayChange.slice(1)}%`
          }
        >
          {parseFloat(token.dayChange) >= 0.0
            ? `+ ${formatNumber(token.dayChange)}`
            : `- ${formatNumber(token.dayChange.slice(1))}`}
          %
        </p>
      </td>
      {/* Lock or Bridge Button */}
      <td
        className={classNames(
          lockedAmount ? 'justify-between' : 'justify-end',
          'px-4 py-4 md:px-5 whitespace-nowrap flex flex-col md:flex-row'
        )}
      >
        {lockedAmount && (
          <div className="text-sm flex items-center">
            <span>{lockedAmount} tokens</span>
            <LockClosedIcon className="w-5 h-5 ml-1" />
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            isL1
              ? router.push('/bridge')
              : ModalService.open(LockModal, {
                  token,
                  balance: lockedAmount
                    ? parseFloat(balance) - lockedAmount
                    : balance,
                  refetch,
                  marketName: market.name,
                })
          }}
          className="w-20 h-10 mr-4 text-base font-medium text-white border-2 rounded-lg bg-brand-blue dark:bg-gray-600 border-brand-blue dark:text-gray-300 tracking-tightest-2 font-sf-compact-medium"
        >
          <span>{isL1 ? 'Bridge' : 'Lock'}</span>
        </button>
      </td>
      <td className="px-4 py-4 md:px-2 whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            ModalService.open(GiftModal, {
              token,
              balance: lockedAmount
                ? parseFloat(balance) - lockedAmount
                : balance,
              refetch,
              marketName: market.name,
            })
          }}
          className="w-20 h-10 text-base font-medium bg-white border-2 rounded-lg text-brand-blue dark:bg-gray-600 border-brand-blue dark:text-gray-300 tracking-tightest-2 font-sf-compact-medium"
        >
          <span>Gift</span>
        </button>
      </td>
    </tr>
  )
}
