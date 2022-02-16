import classNames from 'classnames'
import { WalletModal, WatchingStar } from 'components'
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
  formatNumber,
  bigNumberTenPow18,
  bnToFloatString,
} from 'utils'
import { useTokenIconURL } from 'actions'
import { useQuery } from 'react-query'
import {
  ArrowSmUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/solid'
import useThemeMode from 'components/useThemeMode'
import Image from 'next/image'
import BigNumber from 'bignumber.js'
import IdeaverifyIconBlue from '../../assets/IdeaverifyIconBlue.svg'
import { useMixPanel } from 'utils/mixPanel'
import { getRealTokenName } from 'utils/wikipedia'
import { useContext, useEffect, useState, useMemo } from 'react'
import { getURLMetaData } from 'actions/web2/getURLMetaData'
import { GlobeAltIcon } from '@heroicons/react/outline'
import { TrendingUpBlue, TrendingUpGray } from 'assets'
import { deleteUpvoteListing } from 'actions/web2/deleteUpvoteListing'
import { GlobalContext } from 'lib/GlobalContext'
import { upvoteListing } from 'actions/web2/upvoteListing'
import { useWalletStore } from 'store/walletStore'
import ModalService from 'components/modals/ModalService'
import useAuth from 'components/account/useAuth'
import { getSignedInWalletAddress } from 'lib/utils/web3-eth'
import CreateAccountModal from 'components/account/CreateAccountModal'
import { getTimeDifferenceIndays } from 'lib/utils/dateUtil'

type Props = {
  token: any
  market: IdeaMarket
  showMarketSVG: boolean
  compoundSupplyRate: number
  getColumn: (column: string) => any
  lastElementRef?: (node) => void
  onTradeClicked: (token: IdeaToken, market: IdeaMarket) => void
  refetch: () => any
}

export default function TokenRow({
  token,
  market,
  showMarketSVG,
  compoundSupplyRate,
  getColumn,
  onTradeClicked,
  lastElementRef,
  refetch,
}: Props) {
  const { mixpanel } = useMixPanel()
  const marketSpecifics = getMarketSpecificsByMarketName(market.name)

  const { jwtToken, setOnWalletConnectedCallback } = useContext(GlobalContext)

  const [isExpanded, setIsExpanded] = useState(false)
  const [isLocallyUpvoted, setIsLocallyUpvoted] = useState(token?.upVoted) // Used to make upvoting display instantly and not wait on API
  const [localTotalVotes, setLocalTotalVotes] = useState(token?.totalVotes) // Used to make upvoting display instantly and not wait on API

  const { data: urlMetaData, isLoading: isURLMetaDataLoading } = useQuery(
    [token?.url],
    getURLMetaData
  )
  const { tokenIconURL, isLoading: isTokenIconLoading } = useTokenIconURL({
    marketSpecifics,
    tokenName: getRealTokenName(token?.name),
  })
  const { resolvedTheme } = useThemeMode()

  const isOnChain = token?.isOnChain

  // const yearIncome = (
  //   parseFloat(token?.marketCap) * compoundSupplyRate
  // ).toFixed(2)

  const { loginByWallet } = useAuth()

  useEffect(() => {
    setIsLocallyUpvoted(token?.upVoted)
    setLocalTotalVotes(token?.totalVotes)
  }, [token])

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

  const onLoginClicked = async () => {
    if (useWalletStore.getState().web3) {
      const signedWalletAddress = await getSignedInWalletAddress({
        account: useWalletStore.getState().address,
        library: useWalletStore.getState().web3,
      })
      await loginByWallet(signedWalletAddress)
    }
  }

  const onUpvoteClicked = async () => {
    if (!useWalletStore.getState().web3) {
      setOnWalletConnectedCallback(() => () => {
        // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
        if (!jwtToken) {
          onLoginClicked()
          ModalService.open(CreateAccountModal, {})
          return
        }
      })
      ModalService.open(WalletModal)
    } else {
      // if jwtToken is not present, then popup modal and MM popup to ask user to create account or sign in
      if (!jwtToken) {
        onLoginClicked()
        ModalService.open(CreateAccountModal, {})
        return
      }
    }

    const newUpvoteState = !token?.upVoted
    setIsLocallyUpvoted(newUpvoteState)
    const newTotalVotes = newUpvoteState
      ? token?.totalVotes + 1
      : token?.totalVotes - 1
    setLocalTotalVotes(newTotalVotes)

    let response = null
    if (token?.upVoted) {
      response = await deleteUpvoteListing(token?.listingId, jwtToken)
      mixpanel.track('DELETED_UPVOTE', {
        tokenName: token?.name,
      })
    } else {
      response = await upvoteListing(token?.listingId, jwtToken)
      mixpanel.track('UPVOTE', {
        tokenName: token?.name,
      })
    }

    // If upvote failed, then change local state back
    if (!response) {
      setIsLocallyUpvoted(!newUpvoteState)
      setLocalTotalVotes(token?.totalVotes)
    }

    refetch()
  }
  const timeAfterGhostListedInDays = useMemo(() => {
    if (!token?.ghostListedAt) return null
    const ghostListedAt = new Date(token?.ghostListedAt)
    const currentDate = new Date()
    return getTimeDifferenceIndays(ghostListedAt, currentDate)
  }, [token])

  const timeAfterOnChainListedInDays = useMemo(() => {
    if (!token?.onchainListedAt) return null
    const onchainListedAt = new Date(token?.onchainListedAt)
    const currentDate = new Date()
    return getTimeDifferenceIndays(onchainListedAt, currentDate)
  }, [token])

  const onChainListedByString = token?.onchainListedBy
    ? `${token?.onchainListedBy.slice(0, 6)}...${token?.onchainListedBy.slice(
        -4
      )}`
    : ''

  return (
    <tr
      ref={lastElementRef}
      className={classNames(
        !isOnChain && 'bg-gray-100',
        'relative cursor-pointer md:table-row hover:bg-gray-200 dark:hover:bg-gray-600'
      )}
      onClick={() => {
        setIsExpanded(!isExpanded)
        // router.push(
        //   `/i/${marketSpecifics.getMarketNameURLRepresentation()}/${marketSpecifics.getTokenNameURLRepresentation(
        //     token?.name
        //   )}`
        // )

        // mixpanel.track('VIEW_LISTING', {
        //   market: marketSpecifics.getMarketNameURLRepresentation(),
        //   tokenName: marketSpecifics.getTokenNameURLRepresentation(token?.name),
        // })
      }}
    >
      {/* Icon and Name */}
      <td
        className={classNames(
          'relative w-full py-4 md:table-cell md:col-span-3 md:pl-6 whitespace-nowrap md:w-1/3 lg:w-1/2 text-xs md:text-base'
        )}
      >
        <div className="md:hidden absolute right-2 top-6">
          {isExpanded ? (
            <ChevronUpIcon
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 cursor-pointer text-gray-400"
            />
          ) : (
            <ChevronDownIcon
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 cursor-pointer text-gray-400"
            />
          )}
        </div>

        <div className="relative flex items-center w-3/4 mx-auto md:w-full text-gray-900 dark:text-gray-200">
          {showMarketSVG && marketSpecifics.getMarketSVGTheme(resolvedTheme)}
          <div
            className={classNames(
              'flex-shrink-0 w-7.5 h-7.5',
              showMarketSVG && 'ml-2'
            )}
          >
            {isTokenIconLoading ? (
              <div className="w-full h-full bg-gray-400 rounded-full animate-pulse"></div>
            ) : !isOnChain || market?.name === 'URL' ? (
              <GlobeAltIcon className="w-7" />
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
          <div className="ml-4 text-base font-medium leading-5 truncate z-30">
            {displayName && (
              <div>
                <a
                  href={`/i/${token?.listingId}`}
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
        </div>

        {isExpanded && (
          <div className="relative w-full ">
            <div className="flex flex-col">
              <div className="flex flex-col items-center space-y-1 mt-4 pl-10 text-sm items-baseline">
                {token?.ghostListedBy && timeAfterGhostListedInDays ? (
                  <div className="px-2 py-2 bg-black/[.1] rounded-lg whitespace-nowrap">
                    Ghost Listed by
                    <span className="font-bold">
                      @{token?.ghostListedBy}
                    </span>{' '}
                    {timeAfterGhostListedInDays} days ago
                  </div>
                ) : (
                  ``
                )}
                {onChainListedByString && timeAfterOnChainListedInDays ? (
                  <div className="px-2 py-2 bg-black/[.1] rounded-lg whitespace-nowrap">
                    Listed by{' '}
                    <span className="font-bold">{onChainListedByString}</span>{' '}
                    {timeAfterOnChainListedInDays} days ago
                  </div>
                ) : (
                  ``
                )}
              </div>

              {/* Didn't use Next image because can't do wildcard domain allow in next config file */}
              <a
                href={`/i/${token?.listingId}`}
                className="mt-4 px-4 md:px-0 cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="rounded-xl mt-4 h-full md:h-56"
                  src={
                    !isURLMetaDataLoading && urlMetaData && urlMetaData?.ogImage
                      ? urlMetaData.ogImage
                      : '/gray.svg'
                  }
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div className="w-full my-4 text-black/[.5] text-sm text-left leading-5 whitespace-normal">
                  {!isURLMetaDataLoading &&
                  urlMetaData &&
                  urlMetaData?.ogDescription
                    ? urlMetaData.ogDescription
                    : 'No description found'}
                </div>
              </a>
            </div>
          </div>
        )}

        <div className="md:hidden flex justify-between items-center text-center px-10 py-2 my-4 border-b border-t">
          <div>
            <div>Price</div>
            <div>
              {isOnChain ? `$${formatNumber(token?.price)}` : <>&mdash;</>}
            </div>
          </div>
          <div>
            <div>Deposits</div>
            <div>
              {parseFloat(token?.marketCap) > 0.0 ? (
                `$` +
                formatNumberWithCommasAsThousandsSerperator(
                  parseInt(token?.marketCap)
                )
              ) : (
                <>&mdash;</>
              )}
            </div>
          </div>
          <div>
            <div>7D Change</div>
            <div>
              {isOnChain ? (
                <p
                  className={classNames(
                    'text-base font-medium leading-4 tracking-tightest-2 uppercase',
                    parseFloat(token?.weeklyChange) >= 0.0
                      ? 'text-brand-green'
                      : 'text-brand-red'
                  )}
                >
                  {parseFloat(token?.weeklyChange) >= 0.0
                    ? `+ ${parseInt(token?.weeklyChange)}`
                    : `- ${parseInt(token?.weeklyChange.slice(1))}`}
                  %
                </p>
              ) : (
                <>&mdash;</>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex justify-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()

                onUpvoteClicked()
              }}
              className={classNames(
                isLocallyUpvoted
                  ? 'text-blue-500 bg-blue-100'
                  : 'text-gray-400 bg-black/[.1]',
                'flex justify-center items-center space-x-2 w-20 h-10 text-base font-medium rounded-lg dark:bg-gray-600 dark:text-gray-300 hover:border-2 hover:border-blue-500'
              )}
            >
              <span className="">{localTotalVotes}</span>
              {isLocallyUpvoted ? (
                <TrendingUpBlue className="w-4 h-4" />
              ) : (
                <TrendingUpGray className="w-4 h-4" />
              )}
            </button>

            {isOnChain && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTradeClicked(token, market)
                  mixpanel.track('BUY_START', {
                    tokenName: token?.name,
                  })
                }}
                className="flex justify-center items-center w-20 h-10 text-base font-medium text-white border-2 rounded-lg bg-brand-blue dark:bg-gray-600 border-brand-blue dark:text-gray-300 tracking-tightest-2"
              >
                <ArrowSmUpIcon className="w-6 h-6" />
                <span className="mr-1">Buy</span>
              </button>
            )}
          </div>
        </div>
      </td>
      {/* Mobile Verified Badge */}
      {/* <td className="flex items-center justify-center py-4 text-sm leading-5 text-center text-black md:hidden dark:text-white md:table-cell whitespace-nowrap">
        <div className="flex items-center justify-end h-full">
          <div className="w-5 h-5">
            {isOnChain &&
              market?.name !== 'URL' &&
              token?.verified && (
                <IdeaverifyIconBlue className="w-full h-full" />
              )}
          </div>
        </div>
      </td> */}
      {/* Price */}
      <td
        className={classNames(
          isExpanded ? 'pt-4' : 'py-4',
          'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
        )}
      >
        <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
          Price
        </p>
        <p
          className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
          title={'$' + token?.price}
        >
          {isOnChain ? `$${formatNumber(token?.price)}` : <>&mdash;</>}
        </p>
      </td>
      {/* 24H Change */}
      {getColumn('24H Change') && (
        <td
          className={classNames(
            isExpanded ? 'pt-4' : 'py-4',
            'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
          )}
        >
          {isOnChain ? (
            <p
              className={classNames(
                'text-base font-medium leading-4 tracking-tightest-2 uppercase',
                parseFloat(token?.dayChange) >= 0.0
                  ? 'text-brand-green'
                  : 'text-brand-red'
              )}
              title={`${
                parseFloat(token?.dayChange) >= 0.0
                  ? `+ ${parseInt(token?.dayChange)}`
                  : `- ${parseInt(token?.dayChange?.slice(1))}`
              }%`}
            >
              {parseFloat(token?.dayChange) >= 0.0
                ? `+ ${parseInt(token?.dayChange)}`
                : `- ${parseInt(token?.dayChange?.slice(1))}`}
              %
            </p>
          ) : (
            <>&mdash;</>
          )}
        </td>
      )}
      {/* 7D Change */}
      {getColumn('7D Change') && (
        <td
          className={classNames(
            isExpanded ? 'pt-4' : 'py-4',
            'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
          )}
        >
          {isOnChain ? (
            <p
              className={classNames(
                'text-base font-medium leading-4 tracking-tightest-2 uppercase',
                parseFloat(token?.weeklyChange) >= 0.0
                  ? 'text-brand-green'
                  : 'text-brand-red'
              )}
              title={`${
                parseFloat(token?.weeklyChange) >= 0.0
                  ? `+ ${parseInt(token?.weeklyChange)}`
                  : `- ${parseInt(token?.weeklyChange.slice(1))}`
              }%`}
            >
              {parseFloat(token?.weeklyChange) >= 0.0
                ? `+ ${parseInt(token?.weeklyChange)}`
                : `- ${parseInt(token?.weeklyChange.slice(1))}`}
              %
            </p>
          ) : (
            <>&mdash;</>
          )}
        </td>
      )}
      {/* Deposits */}
      {getColumn('Deposits') && (
        <td
          className={classNames(
            isExpanded ? 'pt-4' : 'py-4',
            'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
          )}
        >
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
            Deposits
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={'$' + token?.marketCap}
          >
            {parseFloat(token?.marketCap) > 0.0 ? (
              `$` +
              formatNumberWithCommasAsThousandsSerperator(
                parseInt(token?.marketCap)
              )
            ) : (
              <>&mdash;</>
            )}
          </p>
        </td>
      )}
      {/* %Locked */}
      {/* {getColumn('% Locked') && (
        <td className={classNames(isExpanded ? 'pt-4' : 'py-4', "relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline")}>
          <p className="text-sm font-medium md:hidden tracking-tightest text-brand-gray-4 dark:text-gray-300">
            % Locked
          </p>
          <p
            className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
            title={parseFloat(token?.lockedPercentage) + ' %'}
          >
            {parseFloat(token?.lockedPercentage) * 100.0 > 0.0 ? (
              Math.ceil(parseFloat(token?.lockedPercentage)) + ' %'
            ) : (
              <>&mdash;</>
            )}
          </p>
          {pageLink}
        </td>
      )} */}
      {/* Year Income */}
      {/* {getColumn('1YR Income') && (
        <td
          className={classNames(
            isExpanded ? 'pt-4' : 'py-4',
            'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
          )}
        >
          {isOnChain ? (
            <p
              className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
              title={'$' + yearIncome}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                parseInt(yearIncome)
              )}
            </p>
          ) : (
            <>&mdash;</>
          )}
          {pageLink}
        </td>
      )} */}
      {/* Claimable Income */}
      {/* {getColumn('Claimable Income') ? (
        <td
          className={classNames(
            isExpanded ? 'pt-4' : 'py-4',
            'relative hidden pl-6 md:table-cell whitespace-nowrap align-baseline'
          )}
        >
          {isOnChain ? (
            <p
              className="text-base font-medium leading-4 uppercase tracking-tightest-2 text-very-dark-blue dark:text-gray-300"
              title={'$' + claimableIncome}
            >
              $
              {formatNumberWithCommasAsThousandsSerperator(
                parseInt(claimableIncome)
              )}
            </p>
          ) : (
            <>&mdash;</>
          )}
          {pageLink}
        </td>
      ) : (
        <></>
      )} */}
      {/* Buy Button and upvote button */}
      <td
        className={classNames(
          isExpanded ? 'pt-4' : 'py-4',
          'hidden text-center md:table-cell whitespace-nowrap align-baseline'
        )}
      >
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()

              onUpvoteClicked()
            }}
            className={classNames(
              isLocallyUpvoted
                ? 'text-blue-500 bg-blue-100'
                : 'text-gray-400 bg-black/[.1]',
              'flex justify-center items-center space-x-2 w-20 h-10 text-base font-medium rounded-lg dark:bg-gray-600 dark:text-gray-300 hover:border-2 hover:border-blue-500'
            )}
          >
            <span className="">{localTotalVotes}</span>
            {isLocallyUpvoted ? (
              <TrendingUpBlue className="w-4 h-4" />
            ) : (
              <TrendingUpGray className="w-4 h-4" />
            )}
          </button>

          {isOnChain && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTradeClicked(token, market)
                mixpanel.track('BUY_START', {
                  tokenName: token?.name,
                })
              }}
              className="flex justify-center items-center w-20 h-10 text-base font-medium text-white border-2 rounded-lg bg-brand-blue dark:bg-gray-600 border-brand-blue dark:text-gray-300 tracking-tightest-2"
            >
              <ArrowSmUpIcon className="w-6 h-6" />
              <span className="mr-1">Buy</span>
            </button>
          )}
        </div>
      </td>
      {/* Star desktop */}
      <td
        className={classNames(
          isExpanded ? 'pt-4' : 'py-4',
          'hidden px-3 text-sm leading-5 text-gray-500 md:table-cell dark:text-gray-300 md:pl-3 md:pr-6 whitespace-nowrap align-baseline'
        )}
      >
        <div className="flex items-center justify-center h-full">
          <WatchingStar token={token} />
        </div>
      </td>
    </tr>
  )
}
