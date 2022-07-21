export enum TABLE_NAMES {
  HOME_POSTS,
  HOME_USERS,
  ACCOUNT_HOLDINGS,
  ACCOUNT_TRADES,
  ACCOUNT_OPINIONS,
  ACCOUNT_POSTS,
  ACCOUNT_HOLDERS, // The wallets/users that are staked on this account
  ACCOUNT_STAKED_ON, // The wallets/users that this account is staked on
  ACCOUNT_BOUNTIES,
  LISTING_PAGE_OPINIONS,
  ADD_CITATION_MODAL, // Not a table, but needed to sort data in add citation modal
}

// To change string value being passed into orderBy to backend, you need to change "value" on SortOptions objects
const orderByIndividualRating = 'rating'
// const orderByAverageRating = 'averageRating'
const orderByLatestRatingsCount = 'latestRatingsCount'
const orderByTotalRatingsCount = 'totalRatingsCount'
const orderByCompositeRating = 'compositeRating'
const orderByMarketInterest = 'marketInterest'
const orderByDeposits = 'deposits'
// const orderBy7DChange = 'weekChange'
const orderByHolderCount = 'holders'
const orderByPostedAt = 'postedAt'

const orderByGroupAmount = 'groupAmount'

export const SortOptionsHomePostsTable = {
  COMPOSITE_RATING: {
    id: 1,
    value: orderByCompositeRating,
    displayName: 'Confidence',
  },
  // AVG_RATING: {
  //   id: 2,
  //   value: orderByAverageRating,
  //   displayName: 'Average Rating',
  // },
  MARKET_INTEREST: {
    id: 3,
    value: orderByMarketInterest,
    displayName: 'Controversial',
  },
  NEW: {
    id: 4,
    value: orderByPostedAt,
    displayName: 'New',
  },
  LATEST_RATINGS_COUNT: {
    id: 5,
    value: orderByLatestRatingsCount,
    displayName: '# of Ratings',
  },
}

export const SortOptionsAddCitationsModal = {
  COMPOSITE_RATING: {
    id: 1,
    value: orderByCompositeRating,
    displayName: 'Confidence',
  },
  // AVG_RATING: {
  //   id: 2,
  //   value: orderByAverageRating,
  //   displayName: 'Average Rating',
  // },
  MARKET_INTEREST: {
    id: 3,
    value: orderByMarketInterest,
    displayName: 'Controversial',
  },
}

export const SortOptionsHomeUsersTable = {
  TOTAL_RATINGS_COUNT: {
    id: 1,
    value: orderByTotalRatingsCount,
    displayName: 'Ratings',
  },
  STAKED: {
    id: 2,
    value: orderByDeposits,
    displayName: 'Staked',
  },
  // WEEK_CHANGE: {
  //   id: 3,
  //   value: orderBy7DChange,
  //   displayName: '7D Change',
  // },
  HOLDERS: {
    id: 3,
    value: orderByHolderCount,
    displayName: 'Holders',
  },
}

// All columns for HomeUsersTable
export const HomeUsersTableColumns = [
  {
    content: '',
    value: 'name',
    sortable: false,
  },
  {
    content: SortOptionsHomeUsersTable.STAKED.displayName,
    value: SortOptionsHomeUsersTable.STAKED.value,
    sortable: true,
  },
  // {
  //   content: SortOptionsHomeUsersTable.WEEK_CHANGE.displayName,
  //   value: SortOptionsHomeUsersTable.WEEK_CHANGE.value,
  //   sortable: true,
  // },
  {
    content: SortOptionsHomeUsersTable.HOLDERS.displayName,
    value: SortOptionsHomeUsersTable.HOLDERS.value,
    sortable: true,
  },
  {
    content: SortOptionsHomeUsersTable.TOTAL_RATINGS_COUNT.displayName,
    value: SortOptionsHomeUsersTable.TOTAL_RATINGS_COUNT.value,
    sortable: true,
  },
  {
    content: 'STAKE',
    value: 'stakeButton',
    sortable: false,
  },
]

// Sorting options for opinion table on listing page
export const SortOptionsListingPageOpinions = {
  // Individual user rating for 1 IDT
  RATING: {
    id: 1,
    value: orderByIndividualRating,
    displayName: 'Rating',
  },
  STAKED: {
    id: 2,
    value: orderByDeposits,
    displayName: 'Staked',
  },
}

// Sorting options for Holders View on listing page
export const SortOptionsAccountHolders = {
  TOTAL_RATINGS_COUNT: {
    id: 1,
    value: orderByTotalRatingsCount,
    displayName: 'Ratings',
  },
  STAKED: {
    id: 2,
    value: orderByDeposits,
    displayName: 'Staked',
  },
  // WEEK_CHANGE: {
  //   id: 3,
  //   value: orderBy7DChange,
  //   displayName: '7D Change',
  // },
  HOLDERS: {
    id: 3,
    value: orderByHolderCount,
    displayName: 'Holders',
  },
}

// Sorting options for posts table on account page
export const SortOptionsAccountPosts = {
  COMPOSITE_RATING: {
    id: 1,
    value: orderByCompositeRating,
    displayName: 'Confidence',
  },
  // AVG_RATING: {
  //   id: 2,
  //   value: orderByAverageRating,
  //   displayName: 'Average Rating',
  // },
  MARKET_INTEREST: {
    id: 3,
    value: orderByMarketInterest,
    displayName: 'Controversial',
  },
  RATINGS: {
    id: 4,
    value: orderByLatestRatingsCount,
    displayName: 'Ratings',
  },
}

// Sorting options for opinion table on account page
export const SortOptionsAccountOpinions = {
  // AVG_RATING: {
  //   id: 1,
  //   value: orderByAverageRating,
  //   displayName: 'Average Rating',
  // },
  MARKET_INTEREST: {
    id: 1,
    value: orderByMarketInterest,
    displayName: 'Controversial',
  },
  // Individual user rating for 1 IDT
  RATING: {
    id: 2,
    value: orderByIndividualRating,
    displayName: 'Rating',
  },
  RATINGS: {
    id: 3,
    value: orderByLatestRatingsCount,
    displayName: 'Ratings',
  },
}

export const SortOptionsAccountBounties = {
  GROUP_AMOUNT: {
    id: 1,
    value: orderByGroupAmount,
    displayName: 'Amount',
  },
}

const getSortOptionsByTable = (tableName: TABLE_NAMES) => {
  switch (tableName) {
    case TABLE_NAMES.HOME_POSTS:
      return SortOptionsHomePostsTable
    case TABLE_NAMES.HOME_USERS:
      return SortOptionsHomeUsersTable
    case TABLE_NAMES.ACCOUNT_OPINIONS:
      return SortOptionsAccountOpinions
    case TABLE_NAMES.ACCOUNT_POSTS:
      return SortOptionsAccountPosts
    case TABLE_NAMES.LISTING_PAGE_OPINIONS:
      return SortOptionsListingPageOpinions
    case TABLE_NAMES.ADD_CITATION_MODAL:
      return SortOptionsAddCitationsModal
    case TABLE_NAMES.ACCOUNT_HOLDERS:
      return SortOptionsAccountHolders
  }
}

export const getSortOptionDisplayNameByID = (
  sortOptionID: number,
  tableName: TABLE_NAMES
) => {
  const sortOptions = getSortOptionsByTable(tableName)
  const displayName = Object.values(sortOptions).find(
    (option) => option.id === sortOptionID
  )?.displayName
  return displayName
}

/**
 * @param sortOptionValue The value that the backend/subgraph use for sorting (passed in orderBy)
 */
export const getSortOptionDisplayNameByValue = (
  sortOptionValue: string,
  tableName: TABLE_NAMES
) => {
  const sortOptions = getSortOptionsByTable(tableName)
  const displayName = Object.values(sortOptions).find(
    (option) => option.value === sortOptionValue
  )?.displayName
  return displayName
}

export enum TIME_FILTER {
  ONE_DAY,
  ONE_WEEK,
  ONE_MONTH,
  ONE_YEAR,
  ALL_TIME,
}

export const TimeFilterOptions = {
  ONE_DAY: {
    value: TIME_FILTER.ONE_DAY,
    displayName: 'Past Day',
  },
  ONE_WEEK: {
    value: TIME_FILTER.ONE_WEEK,
    displayName: 'Past Week',
  },
  ONE_MONTH: {
    value: TIME_FILTER.ONE_MONTH,
    displayName: 'Past Month',
  },
  ONE_YEAR: {
    value: TIME_FILTER.ONE_YEAR,
    displayName: 'Past Year',
  },
  ALL_TIME: {
    value: TIME_FILTER.ALL_TIME,
    displayName: 'All Time',
  },
}

export const getTimeFilterDisplayNameByValue = (
  timeFilterValue: TIME_FILTER
) => {
  const displayName = Object.values(TimeFilterOptions).find(
    (option) => option.value === timeFilterValue
  )?.displayName
  return displayName
}
