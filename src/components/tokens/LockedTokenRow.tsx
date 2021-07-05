import { useRouter } from 'next/dist/client/router'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import moment from 'moment'

import {
  calculateCurrentPriceBN,
  bigNumberTenPow18,
  formatNumberWithCommasAsThousandsSerperator,
  web3BNToFloatString,
  calculateIdeaTokenDaiValue,
  ZERO_ADDRESS,
} from 'utils'
import { IdeaMarket, IdeaToken } from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import { A, AddToMetamaskButton } from 'components'
import { useTokenIconURL } from 'actions'
import { BadgeCheckIcon } from '@heroicons/react/solid'

const tenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export default function LockedTokenRow({
  token,
  market,
  balance,
  balanceBN,
  lockedUntil,
}: {
  token: IdeaToken
  market: IdeaMarket
  balance: string
  balanceBN: BN
  lockedUntil: number
}) {
  const router = useRouter()
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
    tenPow18,
    2
  )

  const balanceValueBN = calculateIdeaTokenDaiValue(
    token?.rawSupply,
    market,
    balanceBN
  )
  const balanceValue = formatNumberWithCommasAsThousandsSerperator(
    web3BNToFloatString(balanceValueBN, bigNumberTenPow18, 2)
  )

  return (
    <>
      <tr
        className="grid grid-cols-3 border-b dark:border-gray-500 dark:hover:bg-gray-500 cursor-pointer md:table-row hover:bg-brand-gray border-brand-border-gray"
        onClick={() => {
          router.push(
            `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
              token.name
            )}`
          )
        }}
      >
        {/* Market desktop */}
        <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-gray-500 dark:text-gray-300 hidden md:table-cell whitespace-nowrap">
          <div className="flex items-center justify-end w-full h-full">
            <div className="w-5 h-5">{marketSpecifics.getMarketSVGTheme()}</div>
          </div>
        </td>
        <td className="col-span-3 px-6 py-4 whitespace-nowrap">
          <div className="flex items-center text-gray-900 dark:text-gray-200">
            <div className="flex-shrink-0 w-7.5 h-7.5">
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
            <div className="ml-4 text-base font-semibold leading-5">
              <A
                href={`${marketSpecifics.getTokenURL(token.name)}`}
                className="hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {token.name}
              </A>
            </div>
            {/* Verified Badge */}
            {token.tokenOwner !== ZERO_ADDRESS && (
              <div className="w-5 h-5 ml-1.5">
                <BadgeCheckIcon />
              </div>
            )}
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
        {/* Market mobile */}
        <td className="px-6 py-4 whitespace-nowrap md:hidden">
          <p className="text-sm font-semibold tracking-tightest text-brand-gray-4 dark:text-gray-400">
            Market
          </p>
          <div className="inline-block w-4 h-4">
            {marketSpecifics.getMarketSVGTheme()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
            Price
          </p>
          <p
            className="text-base font-semibold leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
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
            className="text-base font-semibold leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
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
            className="text-base font-semibold leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + balanceValue}
          >
            ${balanceValue}
          </p>
        </td>
        <td className="px-6 py-4">
          <p className="text-sm font-semibold md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-400">
            Locked Until
          </p>
          <p
            className="text-base font-semibold leading-4 tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={moment(lockedUntil * 1000).format('LLL')}
          >
            {moment(lockedUntil * 1000).format('LLL')}
          </p>
        </td>
        {/* Add to Metamask button */}
        <td className="pr-4 md:px-4 py-4">
          <div className="flex items-center w-full h-full">
            <AddToMetamaskButton token={token} />
          </div>
        </td>
      </tr>
    </>
  )
}
