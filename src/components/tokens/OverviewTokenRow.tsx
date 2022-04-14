import classNames from 'classnames'
import { WatchingStar } from 'components'
import { NETWORK } from 'store/networks'
import { queryDaiBalance } from 'store/daiStore'
import {
  queryInterestManagerTotalShares,
  IdeaMarket,
  IdeaToken,
} from 'store/ideaMarketsStore'
import { getMarketSpecificsByMarketName } from 'store/markets'
import {
  formatNumberWithCommasAsThousandsSerperator,
  bigNumberTenPow18,
  bnToFloatString,
  formatNumberInt,
} from 'utils'
import { useQuery } from 'react-query'
import BigNumber from 'bignumber.js'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { useMixPanel } from 'utils/mixPanel'
import { useMemo } from 'react'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { ChatIcon } from '@heroicons/react/outline'
import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'
import { convertAccountName } from 'lib/utils/stringUtil'
import A from 'components/A'
import { isETHAddress } from 'utils/addresses'
import ListingContent from './ListingContent'
import { getListingTypeFromIDTURL, LISTING_TYPE } from './utils/ListingUtils'
import { useRouter } from 'next/router'

type Props = {
  token: any
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  tradeOrListSuccessToggle: boolean
  getColumn: (column: string) => any
  lastElementRef?: (node) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
  onRateClicked: (idt: IdeaToken, urlMetaData: any) => void
  refetch: () => any
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  tradeOrListSuccessToggle,
  getColumn,
  onTradeClicked,
  onRateClicked,
  lastElementRef,
  refetch,
}: Props) {
  const { mixpanel } = useMixPanel()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)

  const router = useRouter()

  const { data: urlMetaData } = useQuery([token?.url], () =>
    getURLMetaData(token?.url)
  )

  const isOnChain = token?.isOnChain

  const { onchainListedAt, onchainListedBy } = (token || {}) as any

  const isOnchainListedByETHAddress = isETHAddress(onchainListedBy)

  const timeAfterOnChainListedInDays = useMemo(() => {
    if (!onchainListedAt) return null
    const onchainListedAtDate = new Date(onchainListedAt)
    const currentDate = new Date()
    return getTimeDifferenceIndays(onchainListedAtDate, currentDate)
  }, [onchainListedAt])

  const { data: interestManagerTotalShares } = useQuery(
    'interest-manager-total-shares',
    queryInterestManagerTotalShares
  )

  const interestManagerAddress =
    NETWORK.getDeployedAddresses().interestManagerAVM
  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance'],
    () => queryDaiBalance(interestManagerAddress)
  )

  const displayName =
    urlMetaData && urlMetaData?.ogTitle
      ? urlMetaData?.ogTitle
      : marketSpecifics?.convertUserInputToTokenName(token?.url)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const claimableIncome =
    interestManagerTotalShares &&
    interestManagerDaiBalance &&
    isOnChain &&
    token?.rawInvested
      ? bnToFloatString(
          new BigNumber(token?.rawInvested.toString())
            .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
            .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
            .minus(new BigNumber(token?.rawMarketCap.toString())),
          bigNumberTenPow18,
          2
        )
      : '0'

  return (
    <tr
      ref={lastElementRef}
      className="relative h-28 cursor-pointer md:table-row hover:bg-black/[.02] dark:hover:bg-gray-600"
      onClick={() => {
        router.push(`/i/${token?.address}`)
      }}
    >
      {/* Icon and Name */}
      <td
        className={classNames(
          'relative w-full py-4 md:py-8 md:table-cell md:col-span-3 md:pl-14 whitespace-nowrap md:w-1/3 lg:w-1/2 text-xs md:text-base  align-baseline'
        )}
      >
        <div className="hidden md:block absolute left-5 md:left-6 top-7 md:top-11">
          <WatchingStar token={token} />
        </div>

        <div className="relative flex items-center w-3/4 pl-4 md:pl-0 md:w-full text-gray-900 dark:text-gray-200">
          {/* If tweet, replace meta data preview with Listed By */}
          {getListingTypeFromIDTURL(token?.url) === LISTING_TYPE.TWEET ? (
            <>
              {onchainListedBy && timeAfterOnChainListedInDays && (
                <div className="px-2 py-2 mt-1 rounded-lg whitespace-nowrap">
                  Listed by{' '}
                  {isOnchainListedByETHAddress ? (
                    <A
                      className="underline font-bold hover:text-blue-600"
                      href={`https://arbiscan.io/address/${onchainListedBy}`}
                    >
                      {convertAccountName(onchainListedBy)}
                    </A>
                  ) : (
                    <span className="font-bold">
                      {convertAccountName(onchainListedBy)}
                    </span>
                  )}{' '}
                  {timeAfterOnChainListedInDays} days ago
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-base font-medium leading-5 truncate z-30">
                {displayName && (
                  <div>
                    <a
                      href={`/i/${token?.address}`}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs md:text-base font-bold hover:underline"
                    >
                      {displayName?.substr(
                        0,
                        displayName?.length > 50 ? 50 : displayName?.length
                      ) + (displayName?.length > 50 ? '...' : '')}
                    </a>
                  </div>
                )}
                <a
                  href={token?.url}
                  className="text-xs md:text-sm text-brand-blue hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {token?.url.substr(
                    0,
                    token?.url.length > 50 ? 50 : token?.url.length
                  ) + (token?.url.length > 50 ? '...' : '')}
                </a>
              </div>
              {/* Desktop Verified Badge */}
              {isOnChain && market?.name !== 'URL' && token?.verified && (
                <div className="hidden md:inline w-5 h-5 ml-1.5 text-black dark:text-white">
                  <IdeaverifyIconBlue className="w-full h-full" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="relative w-full ">
          <div className="flex flex-col">
            <div className="px-4 md:px-0 md:w-[80%] mt-4">
              <ListingContent
                ideaToken={token}
                page="HomePage"
                urlMetaData={urlMetaData}
                useMetaData={
                  getListingTypeFromIDTURL(token?.url) !== LISTING_TYPE.TWEET
                }
              />
            </div>

            <div className="pl-4 md:pl-0 flex flex-col items-center space-x-0 space-y-1 mt-4 text-sm items-baseline">
              {getListingTypeFromIDTURL(token?.url) !== LISTING_TYPE.TWEET &&
                onchainListedBy &&
                timeAfterOnChainListedInDays && (
                  <div className="py-2 rounded-lg whitespace-nowrap">
                    Listed by{' '}
                    {isOnchainListedByETHAddress ? (
                      <A
                        className="underline font-bold hover:text-blue-600"
                        href={`https://arbiscan.io/address/${onchainListedBy}`}
                      >
                        {convertAccountName(onchainListedBy)}
                      </A>
                    ) : (
                      <span className="font-bold">
                        {convertAccountName(onchainListedBy)}
                      </span>
                    )}{' '}
                    {timeAfterOnChainListedInDays} days ago
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex justify-between items-start text-center px-10 py-2 my-4 border-b border-t">
          <div>
            <div className="font-semibold text-black/[.5]">Average Rating</div>
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-gray-300 mr-1 font-extrabold text-xl">
                {formatNumberInt(token?.averageRating)}
              </span>
              <span className="text-black/[.3] text-sm">
                (
                {formatNumberWithCommasAsThousandsSerperator(
                  token?.latestRatingsCount
                )}
                )
              </span>
            </div>
          </div>
          <div>
            <div className="font-semibold text-black/[.5]">Comments</div>
            <div className="flex items-center font-medium text-lg">
              <ChatIcon className="w-4 mr-1" />
              {formatNumberWithCommasAsThousandsSerperator(
                token?.latestCommentsCount
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex justify-between items-center px-10">
            <div className="">
              <WatchingStar token={token} />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onRateClicked(token, urlMetaData)
              }}
              className="flex justify-center items-center w-20 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
            >
              <span>Rate</span>
            </button>
          </div>
        </div>
      </td>

      {/* Rating */}
      <td className="relative pt-11 hidden md:table-cell whitespace-nowrap align-top">
        <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
          Rating
        </p>
        <div className="flex flex-col justify-start font-medium leading-5">
          <span className="mb-1">
            <span className="w-10 h-8 flex justify-center items-center rounded-lg bg-blue-100 text-blue-600 dark:text-gray-300 font-extrabold text-xl">
              {formatNumberInt(token?.averageRating)}
            </span>
          </span>
          <span className="text-black/[.3] text-sm">
            (
            {formatNumberWithCommasAsThousandsSerperator(
              token?.latestRatingsCount
            )}
            )
          </span>
        </div>
      </td>

      {/* Comments */}
      <td className="relative pt-12 hidden md:table-cell whitespace-nowrap align-top">
        <p
          className="flex items-center font-medium leading-4 uppercase text-very-dark-blue dark:text-gray-300"
          title={`${token?.latestCommentsCount}`}
        >
          <ChatIcon className="w-4 mr-1" />
          <span>
            {formatNumberWithCommasAsThousandsSerperator(
              token?.latestCommentsCount
            )}
          </span>
        </p>
      </td>

      {/* Buy Button and upvote button */}
      <td className="relative pt-8 hidden text-center md:table-cell whitespace-nowrap align-top">
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRateClicked(token, urlMetaData)
              mixpanel.track('HOME_ROW_RATE_START_CLICKED', {
                tokenName: token?.name,
              })
            }}
            className="flex justify-center items-center w-20 h-10 text-base font-medium text-white rounded-lg bg-black/[.8] dark:bg-gray-600 dark:text-gray-300 tracking-tightest-2"
          >
            <span>Rate</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
