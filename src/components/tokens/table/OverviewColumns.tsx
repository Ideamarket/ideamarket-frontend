import React from 'react'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/tooltip/Tooltip'
import { A } from 'components'
import { useQuery } from 'react-query'
import {
  IdeaMarket,
  queryInterestManagerTotalShares,
} from 'store/ideaMarketsStore'
import { queryDaiBalance } from 'store/daiStore'
import { NETWORK } from 'store/networks'
import BN from 'bn.js'
import {
  bigNumberTenPow18,
  formatNumber,
  formatNumberWithCommasAsThousandsSerperator,
  bnToFloatString,
} from 'utils'

type Props = {
  currentColumn: string
  orderDirection: string
  columnData: Array<any>
  columnClicked: (column: string) => void
  markets: IdeaMarket[]
}

function IncomeColumn() {
  return (
    <>
      1YR
      <br />
      <div className="flex items-center">
        Income [Paused]
        <Tooltip className="ml-1">
          <div className="w-32 md:w-64">
            ARBITRUM UPGRADE: Since{' '}
            <A href="https://compound.finance" className="underline">
              compound.finance
            </A>{' '}
            is not on Arbitrum, interest generation has been paused until they
            launch, or we replace them with another lending protocol. Columns
            currently display ~3% APR
          </div>
        </Tooltip>
      </div>
    </>
  )
}

export const OverviewColumns = ({
  currentColumn,
  orderDirection,
  columnData,
  columnClicked,
  markets,
}: Props) => {
  const { data: interestManagerTotalShares } = useQuery(
    'interest-manager-total-shares',
    queryInterestManagerTotalShares
  )

  const interestManagerAddress = NETWORK.getDeployedAddresses().interestManager
  const { data: interestManagerDaiBalance } = useQuery(
    ['interest-manager-dai-balance', interestManagerAddress],
    queryDaiBalance
  )

  let allPlatformsEarnedBN = new BigNumber('0')
  const platformEarnedPairs = [] // { name, earned } -- name = platform name, earned = amount platform earned
  markets.forEach((market) => {
    const platformEarnedBN =
      interestManagerTotalShares && interestManagerDaiBalance
        ? new BigNumber(market.rawPlatformFeeInvested.toString())
            .dividedBy(new BigNumber(interestManagerTotalShares.toString()))
            .multipliedBy(new BigNumber(interestManagerDaiBalance.toString()))
            .plus(
              new BigNumber(
                (market.rawPlatformFeeRedeemed || new BN('0')).toString()
              )
            )
        : new BigNumber('0')

    const platformEarned = bnToFloatString(
      platformEarnedBN,
      bigNumberTenPow18,
      4
    )
    platformEarnedPairs.push({
      name: market.name,
      earned:
        parseFloat(platformEarned) < 1000
          ? formatNumber(parseFloat(platformEarned))
          : formatNumberWithCommasAsThousandsSerperator(
              parseInt(platformEarned)
            ),
    })
    allPlatformsEarnedBN = allPlatformsEarnedBN.plus(platformEarnedBN)
  })
  // If over $1,000 - no decimals
  // If under $1,000 - show cents also
  const allPlatformsEarnedString = bnToFloatString(
    allPlatformsEarnedBN,
    bigNumberTenPow18,
    4
  )
  const allPlatformsEarned =
    parseFloat(allPlatformsEarnedString) < 1000
      ? formatNumber(parseFloat(allPlatformsEarnedString))
      : formatNumberWithCommasAsThousandsSerperator(
          parseInt(allPlatformsEarnedString)
        )

  function getColumnContent(column) {
    switch (column.value) {
      case 'income':
        return <IncomeColumn />
      case 'claimable':
        return (
          <>
            Claimable
            <br />
            Income
          </>
        )
      case 'change':
        return (
          <>
            24H
            <br />
            Change
          </>
        )
      default:
        return column.content
    }
  }

  return (
    <>
      {columnData.map((column) => {
        // For last 2 column headers, do not use header title. Instead, show money earned by platforms
        if (column.value === 'trade') {
          return (
            <th
              colSpan={2}
              className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-gray-600 dark:text-gray-50"
              key={column.value}
            >
              ${allPlatformsEarned}
              <br />
              <div className="flex items-center">
                earned for platforms
                <Tooltip className="ml-1">
                  <div className="w-64">
                    {platformEarnedPairs.map((pair) => (
                      <div key={pair.name}>
                        ${pair.earned} earned for {pair.name}
                      </div>
                    ))}
                    <br />
                    If you represent one of these companies, email
                    team@ideamarket.io to claim your new income stream.
                  </div>
                </Tooltip>
              </div>
            </th>
          )
        } else {
          return (
            <th
              className={classNames(
                'pl-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50 dark:bg-gray-600 dark:text-gray-50',
                column.sortable && 'cursor-pointer',
                column.value !== 'rank' && 'pr-6'
              )}
              key={column.value}
              onClick={() => {
                if (column.sortable) {
                  columnClicked(column.value)
                }
              }}
            >
              {column.sortable && (
                <>
                  {currentColumn === column.value &&
                    orderDirection === 'asc' && <span>&#x25B2;&nbsp;</span>}
                  {currentColumn === column.value &&
                    orderDirection === 'desc' && <span>&#x25bc;&nbsp;</span>}
                </>
              )}
              {getColumnContent(column)}
            </th>
          )
        }
      })}
    </>
  )
}
