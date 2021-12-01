export const MainFilters = {
  TOP: {
    id: 1,
    value: 'Top',
  },
  HOT: {
    id: 2,
    value: 'Hot',
  },
  NEW: {
    id: 3,
    value: 'New',
  },
  // VERIFIED: {
  //   id: 4,
  //   name: 'Verified Only',
  //   value: 'Verified',
  // },
  // STARRED: {
  //   id: 5,
  //   value: 'Starred',
  // },
}

export const CheckboxFilters = {
  PLATFORMS: {
    id: 1,
    name: 'Platforms',
    values: ['All'], // Don't hardcode the markets. They are set in OverviewFilters component below
  },
  COLUMNS: {
    id: 2,
    name: 'Columns',
    values: [
      'All',
      'Deposits',
      '% Locked',
      '1YR Income',
      '24H Change',
      '7D Change',
      'Claimable Income',
    ],
  },
}

export const toggleMarketHelper = (
  marketName: string,
  selectedMarkets: Set<string>
) => {
  const newSet = new Set(selectedMarkets)

  if (newSet.has('None')) {
    newSet.delete('None')
  }

  if (newSet.has(marketName)) {
    newSet.delete(marketName)
    if (newSet.size === 0) {
      // If removed last option, add 'None' which will query to show no tokens
      newSet.add('None')
    }
    if (marketName === 'All') {
      // Remove all other options too
      newSet.clear()
      // If clicked 'All', add 'None' which will query to show no tokens
      newSet.add('None')
    }
    if (newSet.has('All') && marketName !== 'All') {
      // Remove 'All' option if any option is removed
      newSet.delete('All')
    }
  } else {
    if (marketName === 'All') {
      CheckboxFilters.PLATFORMS.values.forEach((platform) => {
        if (!newSet.has(platform)) {
          newSet.add(platform)
        }
      })
    } else {
      newSet.add(marketName)
      // If all options selected, make sure the 'All' option is selected too
      if (CheckboxFilters.PLATFORMS.values.length - newSet.size === 1) {
        newSet.add('All')
      }
    }
  }

  return newSet
}

export const toggleColumnHelper = (
  columnName: string,
  selectedColumns: Set<string>
) => {
  const newSet = new Set(selectedColumns)

  if (newSet.has(columnName)) {
    newSet.delete(columnName)
    if (columnName === 'All') {
      // Remove all other options too
      newSet.clear()
    }
    if (newSet.has('All') && columnName !== 'All') {
      // Remove 'All' option if any option is removed
      newSet.delete('All')
    }
  } else {
    if (columnName === 'All') {
      CheckboxFilters.COLUMNS.values.forEach((column) => {
        if (!newSet.has(column)) {
          newSet.add(column)
        }
      })
    } else {
      newSet.add(columnName)
      // If all options selected, make sure the 'All' option is selected too
      if (CheckboxFilters.COLUMNS.values.length - newSet.size === 1) {
        newSet.add('All')
      }
    }
  }

  return newSet
}
