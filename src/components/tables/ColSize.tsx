import useBreakpoint from 'use-breakpoint'
import { BREAKPOINTS } from 'utils/constants'

export enum TABLE_NAMES {
  HOME,
  ACCOUNT_HOLDINGS,
  ACCOUNT_TRADES,
  RATINGS,
  LISTING_PAGE_OPINIONS,
}

type Props = {
  columnData: Array<any>
  tableName: TABLE_NAMES
}

/**
 * This method controls width of columns dynamically
 */
const ColSize = ({ columnData, tableName }: Props) => {
  const { breakpoint } = useBreakpoint(BREAKPOINTS, 'mobile')

  /**
   * This method defines width of columns
   */
  const getColumnWidth = (column: any): string => {
    if (tableName === TABLE_NAMES.HOME) {
      switch (column.value) {
        case 'name':
          return '35%'
        case 'price':
          return '8%'
        case 'dayChange':
          return '8%'
        case 'weekChange':
          return '8%'
        case 'deposits':
          return '8%'
        case 'claimable':
          return '8%'
        case 'comments':
          return '8%'
        case 'avgRating':
          return '8%'
        case 'txButtons':
          return '13%'
        case 'chevron':
          return '4%'
      }
    } else if (tableName === TABLE_NAMES.ACCOUNT_HOLDINGS) {
      switch (column.value) {
        case 'name':
          return '30%'
        case 'price':
          return '9%'
        case 'balance':
          return '9%'
        case 'value':
          return '9%'
        case 'change':
          return '9%'
        case 'lockButton':
          return '10%'
        case 'giftButton':
          return '9%'
      }
    } else if (tableName === TABLE_NAMES.ACCOUNT_TRADES) {
      switch (column.value) {
        case 'name':
          return '30%'
        case 'type':
          return '9%'
        case 'amount':
          return '9%'
        case 'purchaseValue':
          return '9%'
        case 'currentValue':
          return '9%'
        case 'pnl':
          return '10%'
        case 'date':
          return '9%'
      }
    } else if (tableName === TABLE_NAMES.RATINGS) {
      switch (column.value) {
        case 'name':
          return '35%'
        case 'userRating':
          return '13%'
        case 'avgRating':
          return '13%'
        case 'compositeRating':
          return '13%'
        case 'marketInterest':
          return '13%'
        case 'rateButton':
          return '13%'
      }
    }
  }

  return (
    <colgroup>
      {breakpoint !== 'sm' &&
        breakpoint !== 'mobile' &&
        columnData.map((column) => {
          return <col width={getColumnWidth(column)} key={column.value} />
        })}
    </colgroup>
  )
}

export default ColSize
