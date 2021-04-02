import React, { ReactNode } from 'react'
import BN from 'bn.js'
import classNames from 'classnames'

import Tooltip from 'components/tooltip/Tooltip'
import { investmentTokenToUnderlying } from 'store/compoundStore'
import { bigNumberTenPow18, formatNumber, web3BNToFloatString } from 'utils'
import { IdeaMarket } from 'store/ideaMarketsStore'

type Header = {
  content: ReactNode | string
  value: string
  sortable: boolean
}
const headers: Header[] = [
  {
    content: '#',
    value: 'rank',
    sortable: true,
  },
  {
    content: 'Name',
    value: 'name',
    sortable: true,
  },
  {
    content: 'Price',
    value: 'price',
    sortable: true,
  },
  {
    content: '24H Change',
    value: 'change',
    sortable: true,
  },
  {
    content: 'Deposits',
    value: 'deposits',
    sortable: true,
  },
  {
    content: '% Locked',
    value: 'locked',
    sortable: true,
  },
  {
    content: (
      <>
        1YR
        <br />
        <div className="flex items-center">
          Income
          <Tooltip className="ml-1">
            <div className="w-32 md:w-64">
              Estimated annual passive income paid to the listing owner.
              Calculated by Deposits * Lending APY at{' '}
              <a
                href="https://compound.finance"
                target="_blank"
                className="underline"
              >
                compound.finance
              </a>
            </div>
          </Tooltip>
        </div>
      </>
    ),
    value: 'income',
    sortable: true,
  },
]

type Props = {
  currentHeader: string
  orderDirection: string
  headerClicked: (headerValue: string) => void
  isLoading: boolean
  market: IdeaMarket
  compoundExchangeRate: BN
}

export const Header = ({
  currentHeader,
  orderDirection,
  headerClicked,
  isLoading,
  market,
  compoundExchangeRate,
}: Props) => (
  <>
    {headers.map((header) => (
      <th
        className={classNames(
          'pl-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50',
          header.sortable && 'cursor-pointer',
          header.value !== 'rank' && 'pr-6'
        )}
        key={header.value}
        onClick={() => {
          if (header.sortable) {
            headerClicked(header.value)
          }
        }}
      >
        {header.sortable && (
          <>
            {currentHeader === header.value && orderDirection === 'asc' && (
              <span>&#x25B2;</span>
            )}
            {currentHeader === header.value && orderDirection === 'desc' && (
              <span>&#x25bc;</span>
            )}
            &nbsp;
          </>
        )}
        {header.content}
      </th>
    ))}
    <th
      colSpan={2}
      className="px-6 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase bg-gray-50"
    >
      <div className="text-right">
        {!isLoading && market ? (
          <span>
            {'$' +
              formatNumber(
                parseFloat(
                  web3BNToFloatString(
                    investmentTokenToUnderlying(
                      market.rawPlatformFeeInvested,
                      compoundExchangeRate
                    ).add(market.rawPlatformFeeRedeemed),
                    bigNumberTenPow18,
                    4
                  )
                )
              )}
          </span>
        ) : (
          <span>~</span>
        )}
        <br />
        <div className="flex flex-row items-center justify-end">
          earned for {market?.name}
          <Tooltip className="ml-1">
            <div className="w-32 md:w-64">
              Platforms get a new income stream too. Half of the trading fees
              for each market are paid to the platform it curates. To claim
              funds on behalf of Twitter, email{' '}
              <a className="underline" href="mailto:team@ideamarkets.org">
                team@ideamarkets.org
              </a>
            </div>
          </Tooltip>
        </div>
      </div>
    </th>
  </>
)
