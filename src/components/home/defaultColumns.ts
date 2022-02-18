const defaultColumns = [
  // {
  //   id: 1,
  //   name: 'Rank',
  //   content: 'Rank',
  //   value: 'rank',
  //   sortable: true,
  //   isOptional: false,
  //   isSelectedAtStart: true,
  // },
  {
    id: 3,
    name: 'Name',
    content: 'Name',
    value: 'name',
    sortable: false,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 4,
    name: 'Price',
    content: 'Price',
    value: 'price',
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 5,
    name: '24H Change',
    content: '24H Change',
    value: 'dayChange',
    sortable: true,
    isOptional: true,
    isSelectedAtStart: true,
  },
  {
    id: 11,
    name: '7D Change',
    content: '7D Change',
    value: 'weekChange',
    sortable: true,
    isOptional: true,
    isSelectedAtStart: true,
  },
  {
    id: 6,
    name: 'Deposits',
    content: 'Deposits',
    value: 'deposits',
    sortable: true,
    isOptional: true,
    isSelectedAtStart: true,
  },
  {
    id: 7,
    name: 'Locked',
    content: 'Locked',
    value: 'lockedAmount',
    sortable: true,
    isOptional: true,
    isSelectedAtStart: true,
  },
  // {
  //   id: 8,
  //   name: '1YR Income',
  //   content: '1YR Income',
  //   value: 'income',
  //   sortable: true,
  //   isOptional: true,
  //   isSelectedAtStart: true,
  // },
  {
    id: 9,
    name: 'Claimable Income',
    content: 'Claimable Income',
    value: 'claimable',
    sortable: false,
    isOptional: true,
    isSelectedAtStart: false,
  },
  {
    id: 10,
    name: 'Votes',
    content: 'Votes',
    value: 'totalVotes',
    sortable: true,
    isOptional: false,
    isSelectedAtStart: true,
  },
  {
    id: 11,
    name: 'Star',
    content: '',
    value: 'star',
    sortable: false,
    isOptional: false,
    isSelectedAtStart: true,
  },
]

export default defaultColumns
