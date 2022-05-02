export enum TABLE_NAMES {
  HOME_POSTS,
  HOME_USERS,
  ACCOUNT_HOLDINGS,
  ACCOUNT_TRADES,
  ACCOUNT_OPINIONS,
  LISTING_PAGE_OPINIONS,
}

// To change string value being passed into orderBy to backend, you need to change "value" on SortOptions objects
const orderByIndividualRating = 'rating'
const orderByAverageRating = 'averageRating'
const orderByLatestCommentsCount = 'latestCommentsCount'
// const orderByLatestRatingsCount = 'latestRatingsCount'

export const SortOptionsHomeTable = {
  AVG_RATING: {
    id: 1,
    value: orderByAverageRating,
    displayName: 'Average Rating',
  },
  COMMENTS: {
    id: 2,
    value: orderByLatestCommentsCount,
    displayName: 'Comments',
  },
}

// Sorting options for opinion table on listing page
export const SortOptionsListingPageOpinions = {
  // Individual user rating for 1 IDT
  RATING: {
    id: 1,
    value: orderByIndividualRating,
    displayName: 'Rating',
  },
}

// Sorting options for opinion table on account page
export const SortOptionsAccountOpinions = {
  AVG_RATING: {
    id: 1,
    value: orderByAverageRating,
    displayName: 'Average Rating',
  },
  // Individual user rating for 1 IDT
  RATING: {
    id: 2,
    value: orderByIndividualRating,
    displayName: 'Rating',
  },
  COMMENTS: {
    id: 3,
    value: orderByLatestCommentsCount,
    displayName: 'Comments',
  },
}

const getSortOptionsByTable = (tableName: TABLE_NAMES) => {
  switch (tableName) {
    case TABLE_NAMES.HOME_POSTS:
      return SortOptionsHomeTable
    case TABLE_NAMES.ACCOUNT_OPINIONS:
      return SortOptionsAccountOpinions
    case TABLE_NAMES.LISTING_PAGE_OPINIONS:
      return SortOptionsListingPageOpinions
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
