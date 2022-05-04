import { SortOptionsHomePostsTable } from 'utils/tables'

const defaultColumns = [
  {
    id: 1,
    name: 'Name',
    content: 'Name',
    value: 'name',
    sortable: false,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 2,
    name: 'Composite Rating',
    content: 'Composite Rating',
    value: SortOptionsHomePostsTable.COMPOSITE_RATING.value,
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 3,
    name: 'Average Rating',
    content: 'Average Rating',
    value: SortOptionsHomePostsTable.AVG_RATING.value,
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 4,
    name: 'Market Interest',
    content: 'Market Interest',
    value: SortOptionsHomePostsTable.MARKET_INTEREST.value,
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 5,
    name: 'Comments',
    content: 'Comments',
    value: SortOptionsHomePostsTable.COMMENTS.value,
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 6,
    name: 'TX Buttons',
    content: 'Rate',
    value: 'txButtons',
    sortable: false,
    isOptional: false,
    isSelectedAtStart: true,
  },
]

export default defaultColumns
