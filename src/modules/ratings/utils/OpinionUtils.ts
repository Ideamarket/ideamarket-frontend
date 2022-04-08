export const SortOptions = {
  // Individual user rating for 1 IDT
  RATING: {
    id: 7,
    value: 'Rating',
  },
  // HOT: {
  //   id: 2,
  //   value: 'Hot',
  // },
  // NEW: {
  //   id: 3,
  //   value: 'New',
  // },
}

export const getSortOptionDisplayNameByID = (sortOptionID: number) => {
  const displayName = Object.values(SortOptions).find(
    (option) => option.id === sortOptionID
  ).value
  return displayName
}
