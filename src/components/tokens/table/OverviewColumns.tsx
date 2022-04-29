import React from 'react'
import classNames from 'classnames'
import Tooltip from 'components/tooltip/Tooltip'
import { A } from 'components'
import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid'
import { StarIcon } from '@heroicons/react/solid'
import SelectableButton from 'components/buttons/SelectableButton'
import { SortOptionsHomeTable } from 'utils/tables'

type Props = {
  orderBy: string
  orderDirection: string
  columnData: Array<any>
  isStarredFilterActive: boolean
  columnClicked: (column: string) => void
  setIsStarredFilterActive: (isActive: boolean) => void
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
            currently display 6% APR
          </div>
        </Tooltip>
      </div>
    </>
  )
}

export const OverviewColumns = ({
  orderBy,
  orderDirection,
  columnData,
  isStarredFilterActive,
  columnClicked,
  setIsStarredFilterActive,
}: Props) => {
  function getColumnContent(column) {
    switch (column.value) {
      case 'name':
        return (
          <div className="flex items-center space-x-2">
            <div className="-ml-2">
              <SelectableButton
                onClick={setIsStarredFilterActive}
                isSelected={isStarredFilterActive}
                label={<StarIcon className="w-5 h-5" />}
                className="w-9 h-9"
              />
            </div>
          </div>
        )
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
      case 'dayChange':
        return (
          <>
            24H
            <br />
            Change
          </>
        )

      case 'weekChange':
        return (
          <>
            7D
            <br />
            Change
          </>
        )
      case SortOptionsHomeTable.AVG_RATING.value:
        return (
          <>
            Average
            <br />
            Rating
          </>
        )
      default:
        return column.content
    }
  }

  const getColumnStyle = (column) => {
    switch (column.value) {
      case 'name':
        return 'w-[40%] pl-6 pr-24'
      case SortOptionsHomeTable.AVG_RATING.value:
        return 'w-[20%]'
      // case 'compositeRating':
      //   return 'w-[12%]'
      case SortOptionsHomeTable.COMMENTS.value:
        return 'w-[20%]'
      // case 'marketInterest':
      //   return 'w-[12%]'
      case 'txButtons':
        return 'w-[20%]'
      default:
        return ''
    }
  }

  return (
    <>
      {columnData.map((column) => {
        return (
          <div
            className={classNames(
              getColumnStyle(column),
              'flex items-center pr-5 py-5 text-xs leading-4 text-left text-brand-gray-4 dark:text-gray-200 bg-gray-50 dark:bg-gray-600',
              column.sortable && 'cursor-pointer'
            )}
            key={column.value}
            onClick={() => {
              if (column.sortable) {
                columnClicked(column.value)
              }
            }}
          >
            <div className="flex items-center">
              <span className="uppercase mr-1">{getColumnContent(column)}</span>
              {column.sortable && orderBy === column.value && (
                <div
                  className="h-8 z-[42] text-[.65rem] flex justify-center items-center"
                  title="SORT"
                >
                  {orderDirection === 'desc' ? (
                    <SortDescendingIcon className="w-3.5 text-blue-500" />
                  ) : (
                    <SortAscendingIcon className="w-3.5 text-blue-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          // <th
          //   className={classNames(
          //     getColumnStyle(column),
          //     'py-3 text-xs font-medium leading-4 text-left text-gray-500 bg-gray-50 dark:bg-gray-600 dark:text-gray-50',
          //     column.sortable && 'cursor-pointer',
          //     column.value !== 'rank' && 'pr-6'
          //   )}
          //   key={column.value}
          //   onClick={() => {
          //     if (column.sortable) {
          //       columnClicked(column.value)
          //     }
          //   }}
          // >
          //   <div className="flex items-center">
          //     <span className="uppercase mr-1">
          //       {getColumnContent(column)}
          //     </span>
          //     {column.sortable && orderBy === column.value && (
          //       <div
          //         className="h-8 z-[42] text-[.65rem] flex justify-center items-center"
          //         title="SORT"
          //       >
          //         {orderDirection === 'desc' ? (
          //           <SortDescendingIcon className="w-3.5 text-blue-500" />
          //         ) : (
          //           <SortAscendingIcon className="w-3.5 text-blue-500" />
          //         )}
          //       </div>
          //     )}
          //   </div>
          // </th>
        )
      })}
    </>
  )
}
