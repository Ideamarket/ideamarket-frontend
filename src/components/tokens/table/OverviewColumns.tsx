import React from 'react'
import classNames from 'classnames'
import Tooltip from 'components/tooltip/Tooltip'
import { A } from 'components'

type Props = {
  currentColumn: string
  orderDirection: string
  columnData: Array<any>
  columnClicked: (column: string) => void
}

function IncomeColumn() {
  return (
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
  )
}

export const OverviewColumns = ({
  currentColumn,
  orderDirection,
  columnData,
  columnClicked,
}: Props) => (
  <>
    {columnData.map((column) => (
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
            {currentColumn === column.value && orderDirection === 'asc' && (
              <span>&#x25B2;</span>
            )}
            {currentColumn === column.value && orderDirection === 'desc' && (
              <span>&#x25bc;</span>
            )}
            &nbsp;
          </>
        )}
        {column.value === 'income' ? <IncomeColumn /> : column.content}
      </th>
    ))}
  </>
)
