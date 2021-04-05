import React, { ReactNode } from 'react'
import BN from 'bn.js'
import classNames from 'classnames'

import Tooltip from 'components/tooltip/Tooltip'
import { investmentTokenToUnderlying } from 'store/compoundStore'
import { bigNumberTenPow18, formatNumber, web3BNToFloatString } from 'utils'
import { IdeaMarket } from 'store/ideaMarketsStore'
import A from 'components/A'

type Header = {
  content: ReactNode | string
  value: string
  sortable: boolean
}
const headers: Header[] = [
  {
    content: '',
    value: 'market',
    sortable: false,
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
              <A href="https://compound.finance" className="underline">
                compound.finance
              </A>
            </div>
          </Tooltip>
        </div>
      </>
    ),
    value: 'income',
    sortable: true,
  },
  {
    content: 'Trade',
    value: 'trade',
    sortable: false,
  },
  {
    content: 'Watch',
    value: 'watch',
    sortable: false,
  },
]

type Props = {
  currentHeader: string
  orderDirection: string
  headerClicked: (headerValue: string) => void
}

export const Header = ({
  currentHeader,
  orderDirection,
  headerClicked,
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
  </>
)
